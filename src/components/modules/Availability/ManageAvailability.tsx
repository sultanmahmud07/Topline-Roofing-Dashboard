/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddAvailabilityMutation, useGetAllAvailabilitiesQuery } from "@/redux/features/availability/availability";
import { useGetBookedSlotsQuery } from "@/redux/features/inspection/inspection.api";
import { IApiError } from "@/types";
import { IAvailability } from "@/types/availability.interface";
import AvailableSkeleton from "../loader/AvailableSkeleton";

// Default time slots: 9:00 AM to 6:00 PM with 1.5h gaps
const DEFAULT_SLOTS = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00"
];

// Helper to format 24h time to 12h time for display
const formatTimeDisplay = (time24: string) => {
  const [h, m] = time24.split(':');
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m} ${ampm}`;
};

// Helper to format Date object to YYYY-MM-DD local string safely
const formatDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to normalize scheduled time string (e.g. "3:00 PM CDT" -> "3:00 PM")
const normalizeScheduledTime = (scheduledTime: string): string => {
  const parts = scheduledTime.trim().split(/\s+/);
  if (parts.length >= 2) {
    const timePart = parts[0];
    const ampmPart = parts[1].toUpperCase();
    const [h, m] = timePart.split(':');
    const displayHours = parseInt(h, 10).toString();
    return `${displayHours}:${m} ${ampmPart}`;
  }
  return scheduledTime;
};

interface IBookedSlot {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
}

export default function ManageAvailability() {
  const { data: apiData, isLoading: isGetLoading } = useGetAllAvailabilitiesQuery(null);
  const { data: bookedSlotsData, isLoading: isBookedLoading } = useGetBookedSlotsQuery(undefined);
  const bookedSlots: IBookedSlot[] = bookedSlotsData?.data || [];

  const [createAvailability, { isLoading }] = useAddAvailabilityMutation();
  // const [removeAvailability] = useRemoveAvailabilityMutation();

  // --- Calendar State ---
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [timezone, setTimezone] = useState("America/Chicago");

  // --- Data State ---
  // Structure: { "2026-04-20": ["09:00", "10:30", ...], "2026-04-21": [...] }
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, string[]>>({});

  // --- INITIALIZE PREVIOUS DATA ---
  useEffect(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      const initialMap: Record<string, string[]> = {};

      apiData.data.forEach((schedule: IAvailability) => {
        if (schedule.date && schedule.slots) {
          initialMap[schedule.date] = schedule.slots;
        }
      });

      setSelectedDatesMap(initialMap);

      if (apiData.data.length > 0 && apiData.data[0].timezone) {
        setTimezone(apiData.data[0].timezone);
      }
    }
  }, [apiData]);


  // --- Calendar Logic ---
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(currentYear, currentMonth, i));
  }

  const prevMonth = () => setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));

  // Helper to check if a specific date and time slot is booked
  const getIsBooked = (dateStr: string, slot24: string) => {
    return bookedSlots.some((booked) => {
      if (booked.scheduledDate !== dateStr) return false;
      return formatTimeDisplay(slot24) === normalizeScheduledTime(booked.scheduledTime);
    });
  };

  // --- Handlers ---
  // --- Handlers ---
  const toggleDateSelection = (date: Date) => {
    const dateStr = formatDateString(date);

    // Prevent deselecting a date with booked slots
    const hasBookedSlots = bookedSlots.some(booked => booked.scheduledDate === dateStr);
    if (hasBookedSlots && selectedDatesMap[dateStr]) {
      toast.warning("This date contains booked slots and cannot be deselected.");
      return;
    }

    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      if (newMap[dateStr]) {
        // Deselect entirely
        delete newMap[dateStr];
      } else {
        // Select and assign default slots
        newMap[dateStr] = [...DEFAULT_SLOTS];
      }
      return newMap;
    });
  };
  // const handleDateSelection = async (date: Date) => {
  //   console.log(date)
  //   const toastId = toast.loading("Removing availability...");
  //   try {
  //     const res = await removeAvailability(date).unwrap();

  //     if (res.success) {
  //       toast.dismiss(toastId);
  //       toast.success("Availability deleted successfully");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.dismiss(toastId);
  //     const error = err as IApiError;
  //     toast.error(error?.data?.message || "Failed to delete availability");
  //   }
  // };

  const toggleTimeSlot = (dateStr: string, slot: string) => {
    setSelectedDatesMap((prev) => {
      const currentSlots = prev[dateStr] || [];
      const newMap = { ...prev };

      if (currentSlots.includes(slot)) {
        newMap[dateStr] = currentSlots.filter((s) => s !== slot);
      } else {
        newMap[dateStr] = [...currentSlots, slot].sort();
      }
      return newMap;
    });
  };

  const clearAllDates = () => setSelectedDatesMap({});

  const handleSaveAvailability = async () => {
    const dates = Object.keys(selectedDatesMap);
    if (dates.length === 0) {
      toast.warning("Please select at least one date.");
      return;
    }

    const schedulesArray = dates.map((dateStr) => ({
      date: dateStr,
      timezone: timezone,
      slots: selectedDatesMap[dateStr],
      bookingMode: "EXACT_TIME",
      serviceType: "Roofing"
    }));

    const payload = {
      schedules: schedulesArray
    };
    const toastId = toast.loading("Saving availability...");

    try {
      const res = await createAvailability(payload).unwrap();
      if (res.success) {
        toast.success(`Successfully saved ${schedulesArray.length} day(s) of availability!`, { id: toastId });
      }

    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to publish availability", { id: toastId });
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  // --- Render Helpers ---
  const isDateSelected = (date: Date) => !!selectedDatesMap[formatDateString(date)];
  const isToday = (date: Date) => formatDateString(date) === formatDateString(new Date());

  const sortedSelectedDates = Object.keys(selectedDatesMap).sort();

  // ONLY SHOW DATES IN THE RIGHT PANEL IF THEY MATCH THE CALENDAR'S CURRENT MONTH
  const visibleSelectedDates = sortedSelectedDates.filter((dateStr) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  if (isGetLoading || isBookedLoading) {
    return (
      <AvailableSkeleton />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-0 md:p-5 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 md:w-7 md:h-7 text-[#1BAE70]" />
            Manage Availability
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Select dates and configure available time slots for appointments.
          </p>
        </div>

        {/* Global Settings */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1 w-full md:w-auto">
            <div className="flex w-full items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500 shrink-0" />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 w-full sm:w-[200px] h-9 px-1">
                  <SelectValue placeholder="Select Timezone" className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Phoenix">Arizona (no DST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* ================= LEFT: CUSTOM CALENDAR ================= */}
        <Card className="lg:col-span-5 border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden lg:sticky top-6">
          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Select Dates</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg dark:border-zinc-700">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg dark:border-zinc-700">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-center font-semibold text-gray-900 dark:text-white text-base md:text-lg mt-2">
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-4 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
              {calendarCells.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="w-8 h-8 md:w-10 md:h-10" />;

                const selected = isDateSelected(date);
                const today = isToday(date);
                const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);

                const dateStr = formatDateString(date);
                const hasBooked = bookedSlots.some(booked => booked.scheduledDate === dateStr);

                return (
                  <button
                    key={index}
                    onClick={() => toggleDateSelection(date)}
                    disabled={isPast}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 flex flex-col items-center justify-center rounded-full text-xs md:text-sm font-medium transition-all relative",
                      isPast && "text-gray-300 dark:text-zinc-700 cursor-not-allowed",
                      !isPast && !selected && "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300",
                      selected && "bg-[#1BAE70] text-white shadow-md hover:bg-[#16965f]",
                      today && !selected && "border-2 border-[#1BAE70] text-[#1BAE70]"
                    )}
                  >
                    <span>{date.getDate()}</span>
                    {hasBooked && (
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full absolute bottom-1",
                        selected ? "bg-white" : "bg-red-500"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 md:mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs md:text-sm">
              <span className="text-gray-500">{sortedSelectedDates.length} date(s) selected</span>
              {sortedSelectedDates.length > 0 && (
                <button onClick={clearAllDates} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                  Clear All
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ================= RIGHT: TIME SLOT CONFIGURATOR ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Time Slot Configuration</h4>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 leading-relaxed">
                Showing slots for <strong>{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>. Slots auto-generate from 9:00 AM to 6:00 PM (1.5h intervals).
              </p>
            </div>
          </div>

          {visibleSelectedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl px-4 text-center">
              <CalendarIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-300 dark:text-zinc-700 mb-4" />
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">Select dates from the calendar to configure slots.</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {visibleSelectedDates.map((dateStr) => {
                const dateObj = new Date(`${dateStr}T00:00:00`);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const friendlyDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const selectedSlotsForDay = selectedDatesMap[dateStr];

                      const hasBookedSlots = bookedSlots.some(booked => booked.scheduledDate === dateStr);

                      return (
                        <Card key={dateStr} className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
                          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <CalendarIcon className="w-4 h-4 text-[#1BAE70] shrink-0" />
                              <CardTitle className="text-sm md:text-base font-semibold truncate">{dayName}, {friendlyDate}</CardTitle>
                            </div>
                            <button
                              onClick={() => toggleDateSelection(dateObj)}
                              disabled={hasBookedSlots}
                              className={cn(
                                "transition-colors p-1.5 shrink-0 rounded-md",
                                hasBookedSlots
                                  ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                              )}
                              title={hasBookedSlots ? "Cannot remove date with booked slots" : "Remove Date"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </CardHeader>
                          <CardContent className="pt-4 pb-5 md:pt-5 md:pb-6">

                            {selectedSlotsForDay.length === 0 && (
                              <div className="flex items-start md:items-center gap-2 text-amber-600 dark:text-amber-500 text-xs md:text-sm mb-4 bg-amber-50 dark:bg-amber-950/30 p-2.5 md:p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 leading-relaxed">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 md:mt-0" />
                                <span>No time slots available for this day. Users won't be able to book.</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3">
                              {DEFAULT_SLOTS.map((slot) => {
                                const isActive = selectedSlotsForDay.includes(slot);
                                const isBooked = getIsBooked(dateStr, slot);
                                return (
                                  <button
                                    key={slot}
                                    onClick={() => !isBooked && toggleTimeSlot(dateStr, slot)}
                                    disabled={isBooked}
                                    className={cn(
                                      "py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium border-2 transition-all duration-200 w-full md:w-[120px] flex items-center justify-center",
                                      isBooked
                                        ? "border-red-200 bg-red-50/50 text-red-500 cursor-not-allowed dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                                        : isActive
                                          ? "border-[#1BAE70] bg-[#1BAE70]/10 text-[#1BAE70] dark:bg-[#1BAE70]/20"
                                          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-700"
                                    )}
                                  >
                                    {isBooked ? (
                                      <span className="flex flex-col items-center leading-none">
                                        <span className="text-[10px] md:text-xs font-semibold">{formatTimeDisplay(slot)}</span>
                                        <span className="text-[9px] uppercase tracking-wider text-red-400 dark:text-red-500 font-bold mt-0.5">Booked</span>
                                      </span>
                                    ) : (
                                      formatTimeDisplay(slot)
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
              })}
            </div>
          )}

          {/* Fixed Bottom Action Bar */}
          {sortedSelectedDates.length > 0 && (
            <div className="sticky bottom-4 z-10 flex justify-center md:justify-end p-3 md:p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg mt-4">
              <Button
                size="lg"
                onClick={handleSaveAvailability}
                className="w-full md:w-auto bg-[#1BAE70] hover:bg-[#16965f] text-white px-6 md:px-8 h-12 md:h-11 rounded-xl font-semibold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  "Publish Availability"
                )}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}