import { useState } from 'react';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import Header from '../components/Header';

const sampleOptions: DropdownOption[] = [
  { id: 1, label: 'Revenue Opportunities', value: 'revenue' },
  { id: 2, label: 'Affine Org Utilization Report', value: 'affine' },
  { id: 3, label: 'Customer Analytics', value: 'analytics' },
  { id: 4, label: 'Sales Performance', value: 'sales' },
  { id: 5, label: 'Marketing Dashboard', value: 'marketing' },
  { id: 6, label: 'Financial Overview', value: 'financial' },
];

export default function WidgetScannerPage() {
  const [selectedReports, setSelectedReports] = useState<(string | number)[]>([1, 2]);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header />
      <main className="max-w-[1920px] mx-auto px-6 py-8 bg-[#F6F6F6]">
        {/* Main content will go here */}
        <div className="bg-white rounded-lg shadow-sm py-12 px-16">
          <p className="text-[#1E1E1E] text-2xl mb-6">PBI External Widget Checker</p>
          <div className='flex gap-4'>
             <Dropdown
            label="Select Reports"
            options={sampleOptions}
            selectedValues={selectedReports}
            onChange={setSelectedReports}
            placeholder="Select reports..."
            multiSelect={true}
            showTags={true}
            tagColor="red"
            className="w-[50%]"
          />
          <Dropdown
            label="Select Reports"
            options={sampleOptions}
            selectedValues={selectedReports}
            onChange={setSelectedReports}
            placeholder="Select reports..."
            multiSelect={true}
            showTags={true}
            tagColor="red"
            className="w-[50%]"
          />
          </div>
        </div>
      </main>
    </div>
  );
}
