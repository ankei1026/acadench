"""
Dynamic Pricing API Service
Uses ML to calculate program pricing based on various factors
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
# import numpy as np
from datetime import datetime
import uvicorn

app = FastAPI(title="Dynamic Pricing API", version="1.0.0")

# Program base pricing database
PROGRAM_BASE_PRICES = {
    "math": 500,
    "science": 550,
    "english": 450,
    "programming": 700,
    "default": 500
}

# Program minimum sessions (default values, will be overridden by frontend)
PROGRAM_MIN_SESSIONS = {
    "math": 4,
    "science": 4,
    "english": 4,
    "programming": 4,
    "default": 4
}

# Session multipliers based on multiple of minimum sessions
# No discount for minimum sessions
# 2x minimum = 3% discount
# 3x minimum or more = 5% discount
SESSION_DISCOUNT_RULES = {
    "minimum": 1.0,      # No discount
    "double": 0.97,       # 3% discount
    "triple_plus": 0.95   # 5% discount
}

# Setting multipliers (online vs onsite)
SETTING_MULTIPLIERS = {
    "online": 0.9,   # 10% discount for online
    "onsite": 1.0,
}

# Day of week factors (weekends might have different pricing)
DAY_MULTIPLIERS = {
    0: 1.0,  # Monday
    1: 1.0,  # Tuesday
    2: 1.0,  # Wednesday
    3: 1.0,  # Thursday
    4: 1.0,  # Friday
    5: 1.1,  # Saturday - premium
    6: 1.1,  # Sunday - premium
}

# Time slot factors (peak hours)
TIME_MULTIPLIERS = {
    "morning": 0.95,    # Before 12pm
    "afternoon": 1.0,   # 12pm - 5pm
    "evening": 1.1,     # After 5pm
    "default": 1.0,
}


class PricingRequest(BaseModel):
    """Request model for pricing calculation"""
    program_type: str
    session_count: int
    setting: str  # online or onsite
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    min_sessions: Optional[int] = None  # Minimum sessions required for the program


class PricingResponse(BaseModel):
    """Response model for pricing calculation"""
    base_price: float
    session_discount: float
    setting_discount: float
    time_discount: float
    day_discount: float
    total_discount: float
    final_price: float
    price_per_session: float
    original_sessions: int
    requested_sessions: int
    min_sessions_required: int
    discount_tier: Optional[str] = None  # Added to show which tier was applied


def get_time_slot(time_str: str) -> str:
    """Determine time slot from time string"""
    try:
        if not time_str:
            return "default"
        hour = int(time_str.split(':')[0])
        if hour < 12:
            return "morning"
        elif hour < 17:
            return "afternoon"
        else:
            return "evening"
    except:
        return "default"


def get_day_of_week(date_str: str) -> int:
    """Get day of week from date string"""
    try:
        if not date_str:
            return datetime.now().weekday()
        dt = datetime.strptime(date_str, '%Y-%m-%d')
        return dt.weekday()
    except:
        return datetime.now().weekday()


def calculate_session_multiplier(session_count: int, min_sessions: int) -> tuple[float, float, str]:
    """
    Calculate session multiplier based on multiples of minimum sessions

    Returns:
    - multiplier: The discount multiplier
    - discount_percentage: The discount percentage
    - tier: Description of which tier was applied
    """
    if session_count < min_sessions:
        # Should not happen as we validate earlier
        return 1.0, 0, "below_minimum"

    # Calculate how many times the minimum
    multiple = session_count / min_sessions

    if multiple >= 3:
        # 3x or more = 5% discount
        return SESSION_DISCOUNT_RULES["triple_plus"], 5, "triple_plus"
    elif multiple >= 2:
        # 2x = 3% discount
        return SESSION_DISCOUNT_RULES["double"], 3, "double"
    else:
        # Minimum = no discount
        return SESSION_DISCOUNT_RULES["minimum"], 0, "minimum"


def calculate_price(
    program_type: str,
    session_count: int,
    setting: str = "online",
    start_date: Optional[str] = None,
    start_time: Optional[str] = None,
    min_sessions: Optional[int] = None
) -> dict:
    """
    Calculate dynamic pricing using ML-like algorithm

    Factors:
    - Base program price
    - Session count (bulk discount based on multiples of minimum sessions)
    - Setting (online/onsite)
    - Time slot
    - Day of week
    """

    # Get base price from program type
    base_price = PROGRAM_BASE_PRICES.get(program_type.lower(), PROGRAM_BASE_PRICES["default"])

    # Get minimum sessions (use provided value or default)
    min_sessions_required = min_sessions or PROGRAM_MIN_SESSIONS.get(program_type.lower(), PROGRAM_MIN_SESSIONS["default"])

    # Validate session count meets minimum requirement
    if session_count < min_sessions_required:
        raise HTTPException(
            status_code=400,
            detail=f"Session count ({session_count}) is less than minimum required ({min_sessions_required})"
        )

    # Calculate session multiplier based on multiples of minimum sessions
    session_multiplier, session_discount_percentage, discount_tier = calculate_session_multiplier(
        session_count, min_sessions_required
    )

    # Calculate setting discount
    setting_multiplier = SETTING_MULTIPLIERS.get(setting.lower(), 1.0)
    setting_discount = (1 - setting_multiplier) * 100

    # Calculate time discount
    time_slot = get_time_slot(start_time)
    time_multiplier = TIME_MULTIPLIERS.get(time_slot, 1.0)
    time_discount = (1 - time_multiplier) * 100

    # Calculate day discount/premium
    day_of_week = get_day_of_week(start_date)
    day_multiplier = DAY_MULTIPLIERS.get(day_of_week, 1.0)
    day_discount = (1 - day_multiplier) * 100  # Negative for premium days

    # Calculate total multiplier
    total_multiplier = session_multiplier * setting_multiplier * time_multiplier * day_multiplier

    # Calculate final price
    final_price = base_price * session_count * total_multiplier

    # Calculate price per session
    price_per_session = final_price / session_count if session_count > 0 else 0

    # Calculate total discount percentage
    original_price = base_price * session_count
    total_discount = ((original_price - final_price) / original_price * 100) if original_price > 0 else 0

    return {
        "base_price": base_price,
        "session_discount": session_discount_percentage,
        "setting_discount": round(setting_discount, 2),
        "time_discount": round(time_discount, 2),
        "day_discount": round(day_discount, 2),
        "total_discount": round(total_discount, 2),
        "final_price": round(final_price, 2),
        "price_per_session": round(price_per_session, 2),
        "original_sessions": session_count,
        "requested_sessions": session_count,
        "min_sessions_required": min_sessions_required,
        "discount_tier": discount_tier
    }


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "Dynamic Pricing API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/calculate-price", response_model=PricingResponse)
def calculate_pricing(request: PricingRequest):
    """
    Calculate dynamic pricing for a program booking

    Parameters:
    - program_type: Type of program (math, science, english, programming, etc.)
    - session_count: Number of sessions
    - setting: online or onsite
    - start_date: Start date (optional)
    - start_time: Start time (optional)
    - min_sessions: Minimum sessions required (optional)
    """
    try:
        result = calculate_price(
            program_type=request.program_type,
            session_count=request.session_count,
            setting=request.setting,
            start_date=request.start_date,
            start_time=request.start_time,
            min_sessions=request.min_sessions
        )
        return PricingResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/programs")
def get_programs():
    """Get available program types and their base prices"""
    return {
        "programs": PROGRAM_BASE_PRICES,
        "min_sessions": PROGRAM_MIN_SESSIONS,
        "session_discount_rules": {
            "minimum": "No discount",
            "double (2x minimum)": "3% discount",
            "triple or more (3x+ minimum)": "5% discount"
        },
        "settings": list(SETTING_MULTIPLIERS.keys()),
        "time_slots": list(TIME_MULTIPLIERS.keys()),
        "days": {
            "0": "Monday",
            "1": "Tuesday",
            "2": "Wednesday",
            "3": "Thursday",
            "4": "Friday",
            "5": "Saturday",
            "6": "Sunday"
        }
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)
