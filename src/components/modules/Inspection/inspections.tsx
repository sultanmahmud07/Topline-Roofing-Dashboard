import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Trash2,
  Search,
  Mail,
  Phone,
  EyeIcon,
  ClipboardCheck,
  CalendarIcon,
  Clock,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router"; // Added useNavigate
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Adjust these imports to point to your actual inspection API slice
import { useGetAllInspectionsQuery, useRemoveInspectionMutation } from "@/redux/features/inspection/inspection.api";
import { InspectionActionMenu } from "./InspectionActionMenu";
import InspectionSkeleton from "../loader/InspectionSkeleton";

// Updated Interface based on your JSON response
export interface IInspection {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  serviceType: string;
  notes?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  sender: string;
  createdAt: string;
  updatedAt: string;
}


export default function AllInspectionList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const { data, isLoading } = useGetAllInspectionsQuery({
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  });

  const [removeInspection] = useRemoveInspectionMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  const handleRemoveInspection = async (inspectionId: string) => {
    const toastId = toast.loading("Removing inspection record...");
    try {
      const res = await removeInspection(inspectionId).unwrap();

      if (res.success) {
        toast.success("Inspection removed successfully!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove inspection", { id: toastId });
    }
  };

  const totalPage = data?.meta?.totalPage || 1;

  // Helper function to format the scheduled date nicely
  const formatScheduleDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Manage Inspections
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and manage scheduled onsite estimates and inspections.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="w-full pl-9 bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-primary"
              type="text"
              placeholder="Search name, email or city..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <Select onValueChange={handleSortChange} value={sortOrder}>
            <SelectTrigger className="w-full py-5 sm:w-[160px] bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-primary">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Order By</SelectLabel>
                <SelectItem value="-createdAt">Recently Added</SelectItem>
                <SelectItem value="scheduledDate">Schedule Date (Asc)</SelectItem>
                <SelectItem value="-scheduledDate">Schedule Date (Desc)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <InspectionSkeleton />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Client</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Contact Info</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Schedule</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Location</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No inspections found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((inspection: IInspection) => (
                  <TableRow key={inspection._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">

                    {/* Client Name & Service */}
                    <TableCell className="align-top pt-4">
                      <p className="font-bold text-gray-900 dark:text-white capitalize">
                        {inspection.firstName} {inspection.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {inspection.serviceType}
                      </p>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell className="align-top pt-4">
                      <div className="flex flex-col gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`mailto:${inspection.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[150px]" title={inspection.email}>
                            {inspection.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`tel:${inspection.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {inspection.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>

                    {/* Schedule */}
                    <TableCell className="align-top pt-4">
                      <div className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          {formatScheduleDate(inspection.scheduledDate)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          {inspection.scheduledTime}
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="align-top pt-4">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1" title={inspection.address}>
                            {inspection.address}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {inspection.city}, {inspection.state} {inspection.zip}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="align-top pt-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border",
                        inspection.status.toLowerCase() === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                          : inspection.status.toLowerCase() === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"
                      )}>
                        {inspection.status}
                      </span>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="align-top pt-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <Link className="w-full md:mr-2 text-green-600 cursor-pointer" to={`/inspection/view/${inspection._id}`}>
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        {/* Delete Button */}
                        <DeleteConfirmation onConfirm={() => handleRemoveInspection(inspection._id)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DeleteConfirmation>
                        {/* Custom Dropdown Menu */}
                        <InspectionActionMenu inspection={inspection} />

                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem
                    key={page}
                    onClick={() => setCurrentPage(page)}
                  >
                    <PaginationLink
                      className={cn(
                        "cursor-pointer rounded-xl transition-colors",
                        currentPage === page
                          ? "bg-primary text-white hover:bg-[#16965f] hover:text-white border-transparent"
                          : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                      )}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                  className={
                    currentPage === totalPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}