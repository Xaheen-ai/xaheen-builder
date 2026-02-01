/**
 * Example Chef DSL File - Bookings List
 */
import { ListPage, bind, ref, key, go } from "@xala/chef-dsl";
import { Header, Table, FilterBar, Button } from "@xala/chef-dsl/blocks";

export default ListPage({
    id: "bookings-list",
    shell: "authenticated",
    data: {
        bookings: ref("app.bookings.list"),
        isLoading: ref("app.bookings.isLoading"),
    },
    header: Header({
        title: key("pages.bookings.title"),
        subtitle: key("pages.bookings.subtitle"),
        icon: "Calendar",
        primaryAction: Button({ label: key("actions.createBooking"), intent: "primary", onClick: go("booking-create") }),
    }),
    filters: [
        FilterBar({
            search: { placeholder: key("search.bookings"), binding: bind("vm.searchQuery") },
            filters: [
                { id: "status", label: key("filters.status"), type: "select", binding: bind("vm.statusFilter") },
                { id: "dateRange", label: key("filters.dateRange"), type: "daterange", binding: bind("vm.dateFilter") },
            ],
        }),
    ],
    table: Table({
        data: bind("vm.bookings"),
        loading: bind("vm.isLoading"),
        rowKey: "id",
        columns: [
            { key: "customer", label: key("bookings.customer") },
            { key: "service", label: key("bookings.service") },
            { key: "date", label: key("bookings.date"), format: "date" },
            { key: "status", label: key("bookings.status"), variant: "badge" },
        ],
        rowActions: [
            { id: "view", label: key("actions.view"), icon: "Eye", onClick: go("booking-detail", { id: bind("vm.row.id") }) },
            { id: "edit", label: key("actions.edit"), icon: "Pencil", onClick: go("booking-edit", { id: bind("vm.row.id") }) },
        ],
        emptyState: {
            icon: "Calendar",
            title: key("empty.noBookings.title"),
            description: key("empty.noBookings.description"),
            action: Button({ label: key("actions.createFirst"), intent: "primary", onClick: go("booking-create") }),
        },
        pagination: true,
    }),
    actions: [{ id: "refresh", label: key("actions.refresh"), intent: "ghost" }],
});
