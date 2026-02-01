// src/pages/bookings.chef.ts
import { ListPage, bind, ref, key, go } from '@xala/chef-dsl';
import { Table, Header, FilterBar, Button } from '@xala/chef-dsl/blocks';

export default ListPage({
    id: 'bookings-list',
    data: {
        bookings: ref('app.bookings.list'),
        isLoading: ref('app.bookings.isLoading'),
    },
    header: Header({
        title: key('pages.bookings.title'),
        icon: 'Calendar',
        primaryAction: Button({
            label: key('actions.create'),
            intent: 'primary',
            onClick: go('booking-create'),
        }),
    }),
    filters: [
        FilterBar({
            search: { placeholder: key('search.placeholder'), binding: bind('vm.search') },
            filters: [
                { id: 'status', label: key('filters.status'), options: bind('vm.statusOptions') },
            ],
        }),
    ],
    table: Table({
        data: bind('vm.bookings'),
        loading: bind('vm.isLoading'),
        rowKey: 'id',
        columns: [
            { key: 'customer', label: key('bookings.customer') },
            { key: 'date', label: key('bookings.date'), format: 'date' },
            { key: 'status', label: key('bookings.status'), variant: 'badge' },
        ],
        rowActions: [
            { id: 'view', label: key('actions.view'), onClick: go('booking-detail', { id: bind('row.id') }) },
            { id: 'delete', label: key('actions.delete'), intent: 'danger', confirm: true },
        ],
    }),
});
