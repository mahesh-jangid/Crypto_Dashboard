'use client';

import { SortField, SortDirection } from '@/types/coin';
import { CustomDropdown } from './CustomDropdown';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ArrowTrendingUpIcon,
    ArrowDownIcon,
    ArrowUpIcon
} from '@heroicons/react/24/outline';

interface SortControlsProps {
    sortField: SortField;
    sortDirection: SortDirection;
    onSortFieldChange: (field: SortField) => void;
    onSortDirectionChange: (direction: SortDirection) => void;
}

const sortFieldOptions = [
    {
        id: 'market_cap',
        value: 'market_cap',
        label: 'Market Cap',
        icon: <ChartBarIcon className="h-4 w-4" />
    },
    {
        id: 'price',
        value: 'price',
        label: 'Price',
        icon: <CurrencyDollarIcon className="h-4 w-4" />
    },
    {
        id: 'price_change_24h',
        value: 'price_change_24h',
        label: '24h Change',
        icon: <ArrowTrendingUpIcon className="h-4 w-4" />
    }
];

const sortDirectionOptions = [
    {
        id: 'desc',
        value: 'desc',
        label: 'Descending',
        icon: <ArrowDownIcon className="h-4 w-4" />
    },
    {
        id: 'asc',
        value: 'asc',
        label: 'Ascending',
        icon: <ArrowUpIcon className="h-4 w-4" />
    }
];

export function SortControls({
    sortField,
    sortDirection,
    onSortFieldChange,
    onSortDirectionChange,
}: SortControlsProps) {
    return (
        <div className="flex items-center gap-4" style={{ isolation: 'isolate' }}>
            <div className="relative">
                <CustomDropdown
                    label=""
                    options={sortFieldOptions}
                    value={sortField}
                    onChange={(value) => onSortFieldChange(value as SortField)}
                    width="w-44"
                />
            </div>
            <div className="relative">
                <CustomDropdown
                    options={sortDirectionOptions}
                    value={sortDirection}
                    onChange={(value) => onSortDirectionChange(value as SortDirection)}
                    width="w-36"
                />
            </div>
        </div>
    );
}