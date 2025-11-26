import { useState } from 'react';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import Header from '../components/Header';
import Button from '../components/Button';
import Accordion, { type AccordionItem } from '../components/Accordion';

const sampleOptions: DropdownOption[] = [
  { id: 1, label: 'Revenue Opportunities', value: 'revenue' },
  { id: 2, label: 'Affine Org Utilization Report', value: 'affine' },
  { id: 3, label: 'Customer Analytics', value: 'analytics' },
  { id: 4, label: 'Sales Performance', value: 'sales' },
  { id: 5, label: 'Marketing Dashboard', value: 'marketing' },
  { id: 6, label: 'Financial Overview', value: 'financial' },
];

const accordionData: AccordionItem[] = [
  {
    id: 1,
    title: 'Starting Pipeline',
    type: 'pipeline',
    data: {
      status: 'loading',
      downloads: [
        { progress: '1/7', name: 'Affine Org_test_visual' },
        { progress: '2/7', name: 'Sales & Returns Sample v201912' },
        { progress: '3/7', name: 'Affine Org_test_visual&expressions' },
        { progress: '4/7', name: 'testing' },
        { progress: '5/7', name: 'COVID 19 US Tracking Sample' },
        { progress: '6/7', name: 'Life expectancy v202009' },
        { progress: '7/7', name: 'testing' },
      ],
    },
  },
 
  {
    id: 3,
    title: 'Views',
    type: 'views',
    data: {
      reports: [
        {
          id: '01',
          workspaceName: 'PBI Comparision Tool',
          workspaceColor: 'yellow',
          reportName: 'Affine Org_test_visual',
          widgetCount: 0,
          owners: 'yatish.narasimhan@affine.ai, ravi.praneeth@affine.ai',
        },
        {
          id: '02',
          workspaceName: 'PBI Comparision Tool',
          workspaceColor: 'yellow',
          reportName: 'Affine Org_test_visual&expressions',
          widgetCount: 0,
          owners: 'deepjyoti.roy@affine.ai, madhu.m@affine.ai',
        },
        {
          id: '03',
          workspaceName: 'PBI Comparision Tool',
          workspaceColor: 'yellow',
          reportName: 'Testing',
          widgetCount: 0,
          owners: 'meepjyoti.roy@affine.ai, madhu.m@affine.ai',
        },
        {
          id: '04',
          workspaceName: 'PBI Clone Test',
          workspaceColor: 'green',
          reportName: 'Life expectancy v202009',
          widgetCount: 0,
          owners: 'madhu.m@affine.ai, ravi.praneeth@affine.ai',
        },
        {
          id: '05',
          workspaceName: 'PBI Clone Test',
          workspaceColor: 'green',
          reportName: 'COVID-19 US Tracking Sample',
          widgetCount: 2,
          owners: 'deepjyoti.roy@affine.ai, amit.kesharwani@affine.ai',
        },
      ],
    },
  },
  {
    id: 4,
    title: 'Email Users',
    type: 'email',
    data: {
      emails: [
        'yatish.narasimhan@affine.ai',
        'ravi.praneeth@affine.ai',
        'deepjyoti.roy@affine.ai',
        'madhu.m@affine.ai',
        'amit.kesharwani@affine.ai',
      ],
    },
  },
];

export default function WidgetScannerPage() {
  const [selectedReports, setSelectedReports] = useState<(string | number)[]>([1, 2]);

  const handleReset = () => {
    setSelectedReports([]);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header />
      <main className="max-w-[1920px] mx-auto px-6 pb-8 bg-[#F6F6F6]">
        {/* Main content will go here */}
        <div className="bg-white rounded-2xl shadow-sm py-12 px-16">
          <p className="text-[#1E1E1E] text-2xl mb-6">PBI External Widget Checker</p>
          <div className='flex gap-4 mb-6'>
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

          {/* Button Examples */}
          <div className="flex flex-row-reverse gap-4">
            <Button 
              variant="outlined" 
              color="danger"
              className='min-w-[8%]'
            //   icon={RotateCcw}
              iconPosition="left"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              variant="filled" 
              color="danger" 
            //   icon={Search}
              iconPosition="left"
            >
              Scan for widgets
            </Button>
          </div>

          {/* Output Section */}
           <h3 className="text-sm font-semibold text-[#6E7C87] mb-2">Output</h3>
          <section id="output" className="mt-4 bg-[#F6F6F6] rounded-lg p-6 max-h-[400px] overflow-y-auto">
           
            <Accordion items={accordionData} allowMultiple={true} />
          </section>
        </div>
      </main>
    </div>
  );
}
