import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/getDateFormater";
import Loader from "@/pages/Spinner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  ClipboardCheck,
  FileText,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

// Assuming you have an IInspection type and the correct API hook exported
import { useGetInspectionDetailsQuery } from "@/redux/features/inspection/inspection.api";
import { IInspection } from "./inspections";
const ViewInspectDetails = () => {
  const { id } = useParams(); // Using ID to fetch details based on standard REST practices
  const { data: responseData, isLoading } = useGetInspectionDetailsQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }
  // Extract the actual inspection data from the nested response
  const inspection: IInspection = responseData;

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-2">
          <ClipboardCheck className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Inspection record not found</p>
        <Link to="/inspection-requests">
          <Button variant="outline" className="mt-2"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Inspections</Button>
        </Link>
      </div>
    );
  }

  // Helper function to format the scheduled date nicely
  const formatScheduleDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-0 md:p-6 lg:p-8">

      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <Link
            to="/inspection-requests"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-[#1BAE70] dark:text-gray-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inspections
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Inspection Details
            <span className={cn(
              "inline-flex items-center px-3 py-1 text-sm rounded-full font-bold uppercase tracking-wide border",
              inspection.status.toLowerCase().trim() === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                : inspection.status.toLowerCase().trim() === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                  // Check for both 1 'L' and 2 'L's just to be safe
                  : ["cancelled", "canceled"].includes(inspection.status.toLowerCase().trim())
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"
            )}>
              {inspection.status}
            </span>
          </h1>
        </div>

        {/* You can add an Edit/Reschedule button here later if needed */}
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* ================= LEFT COLUMN: CLIENT & CONTACT INFO ================= */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#1BAE70]" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">

              {/* Name */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                  {inspection.firstName} {inspection.lastName}
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</p>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${inspection.email}`} className="hover:text-blue-600 transition-colors">
                      {inspection.email}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</p>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${inspection.phone}`} className="hover:text-blue-600 transition-colors">
                      {inspection.phone}
                    </a>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Submission Meta Data */}
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardContent className="p-5 space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <span className="text-gray-500 font-medium">Requested On</span>
                <span className="text-gray-900 dark:text-white font-semibold">{formatDate(inspection.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <span className="text-gray-500 font-medium">Source</span>
                <span className="text-gray-900 dark:text-white font-semibold px-2 py-0.5 bg-gray-100 dark:bg-zinc-900 rounded text-xs">{inspection.sender}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Record ID</span>
                <span className="text-gray-400 font-mono text-xs">{inspection._id.slice(-8)}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ================= RIGHT COLUMN: APPOINTMENT DETAILS ================= */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Primary Schedule Card */}
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 overflow-hidden">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 py-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <CalendarDays className="w-5 h-5" /> Appointment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 shrink-0">
                    <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Scheduled Date</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {formatScheduleDate(inspection.scheduledDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 shrink-0">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Arrival</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {inspection.scheduledTime}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Service & Location Details */}
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-[#1BAE70]" /> Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Service Type */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requested Service</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1BAE70]/10 text-[#1BAE70] dark:bg-[#1BAE70]/20 rounded-lg font-semibold border border-[#1BAE70]/20">
                  <ClipboardCheck className="w-4 h-4" />
                  {inspection.serviceType}
                </div>
              </div>

              {/* Address */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Property Address</p>
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/50">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                      {inspection.address}
                    </p>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                      {inspection.city}, {inspection.state} {inspection.zip}
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Customer Notes */}
          {inspection.notes && (
            <Card className="border-amber-100 dark:border-amber-900/50 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-500">
                  <FileText className="w-5 h-5" /> Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic border-l-4 border-amber-300 dark:border-amber-700 pl-4 py-1">
                  "{inspection.notes}"
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewInspectDetails;