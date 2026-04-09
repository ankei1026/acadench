import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface SessionEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  extendedProps: {
    session_id: string;
    booking_id?: string;
    session_number?: number;
    total_sessions?: number;
    learner?: string;
    tutor?: string;
    program?: string;
    status: string;
    notes?: string;
  };
}

interface SessionsPageProps {
  calendarEvents: SessionEvent[];
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Sessions({ calendarEvents }: SessionsPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: string) => {
    if (!selectedEvent) return;
    setUpdating(true);
    try {
      await router.patch(
        `/admin/sessions/${selectedEvent.id}`,
        { status },
        {
          preserveScroll: true,
          onSuccess: () => {
            setSelectedEvent({
              ...selectedEvent,
              extendedProps: { ...selectedEvent.extendedProps, status },
            });
          },
        }
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Sessions', href: '/admin/sessions' }]}>
      <Head title="Sessions Calendar" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Card className="border border-amber-200 bg-white shadow-sm">
          <CardHeader className="border-b border-amber-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
              Sessions Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              events={calendarEvents}
              eventClick={(info) => {
                setSelectedEvent({
                  id: info.event.id,
                  title: info.event.title,
                  start: info.event.startStr,
                  allDay: info.event.allDay,
                  extendedProps: info.event.extendedProps,
                });
              }}
              height="auto"
              dayMaxEvents={3}
              eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
              eventContent={(eventInfo) => {
                const status = eventInfo.event.extendedProps.status;
                return (
                  <div className="flex items-center gap-1 overflow-hidden rounded bg-gradient-to-r from-amber-500 to-orange-500 p-1 text-xs text-white shadow-sm">
                    <span className="truncate font-medium">{eventInfo.event.title}</span>
                    <Badge className={`ml-auto border-0 ${
                      status === 'completed'
                        ? 'bg-emerald-600'
                        : status === 'ongoing'
                        ? 'bg-blue-600'
                        : status === 'cancelled'
                        ? 'bg-red-600'
                        : 'bg-yellow-500'
                    }`}>{status}</Badge>
                  </div>
                );
              }}
            />
          </CardContent>
        </Card>

        {/* Session Details Dialog */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-amber-800">Session Details</h3>
              <div className="mb-2 text-sm text-gray-700">
                <div><b>Program:</b> {selectedEvent.extendedProps.program || '—'}</div>
                <div><b>Learner:</b> {selectedEvent.extendedProps.learner || '—'}</div>
                <div><b>Tutor:</b> {selectedEvent.extendedProps.tutor || '—'}</div>
                <div><b>Date:</b> {selectedEvent.start}</div>
                <div><b>Status:</b> <Badge>{selectedEvent.extendedProps.status}</Badge></div>
                <div><b>Notes:</b> {selectedEvent.extendedProps.notes || '—'}</div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Update Status</label>
                <div className="flex gap-2">
                  {statusOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={selectedEvent.extendedProps.status === opt.value ? 'default' : 'outline'}
                      disabled={updating || selectedEvent.extendedProps.status === opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
