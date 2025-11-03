'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

interface Option {
    id: string;
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    width?: string;
}

export function CustomDropdown({
    options,
    value,
    onChange,
    label,
    width = 'w-40'
}: CustomDropdownProps) {
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <Listbox value={value} onChange={onChange}>
            <div className={`relative ${width} z-[999]`}>
                {label && (
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </Listbox.Label>
                )}
                <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:bg-gray-50 transition-all duration-200 shadow-sm">
                    <div className="flex items-center min-h-[20px]">
                        {selectedOption?.icon && (
                            <span className="mr-2 text-gray-600 flex items-center">{selectedOption.icon}</span>
                        )}
                        <span className="block truncate font-medium text-gray-700">{selectedOption?.label}</span>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </span>
                </Listbox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-1"
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                >
                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {options.map((option) => (
                            <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                                value={option.value}
                            >
                                {({ selected, active }) => (
                                    <>
                                        <div className="flex items-center min-h-[20px]">
                                            {option.icon && (
                                                <span 
                                                    className={`absolute left-3 flex items-center transition-colors duration-150 ${
                                                        active ? 'text-blue-600' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {option.icon}
                                                </span>
                                            )}
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.label}
                                            </span>
                                        </div>
                                        {selected && (
                                            <span
                                                className={`absolute inset-y-0 right-3 flex items-center ${
                                                    active ? 'text-blue-600' : 'text-blue-500'
                                                }`}
                                            >
                                                <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}