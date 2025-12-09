import { useState, useEffect } from 'react';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import Header from '../components/Header';
import Button from '../components/Button';
import Accordion, { type AccordionItem } from '../components/Accordion';
import { useGetWorkspacesQuery, useLazyGetReportsByWorkspaceQuery, useScanForWidgetsMutation, useLazyDownloadExcelQuery, type ScanResponse } from '../store/slices/apiSlice';

const sampleReportOptions: DropdownOption[] = [
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
    title: 'Pipeline',
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
  const [selectedReports, setSelectedReports] = useState<(string | number)[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<(string | number)[]>([]);
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null);
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspacesQuery();
  const [getReports, { data: reports, isLoading: isLoadingReports }] = useLazyGetReportsByWorkspaceQuery();
  const [scanForWidgets, { isLoading: isScanning }] = useScanForWidgetsMutation();
  const [downloadExcel, { isLoading: isDownloading }] = useLazyDownloadExcelQuery();


  console.log("Scan Results:", scanResults);

  const workspaceOptions: DropdownOption[] = workspaces 
    ? workspaces.map((workspace) => ({
        id: workspace.id,
        label: workspace.name,
        value: workspace.id,
      }))
    : [
        { id: 'b1fb33ce-0258-441f-b99f-873dcbae8e38', label: 'Test1', value: 'b1fb33ce-0258-441f-b99f-873dcbae8e38' },
        { id: 'd1499501-269a-417b-a40d-ba9225004aa5', label: 'PBI Comparison Tool', value: 'd1499501-269a-417b-a40d-ba9225004aa5' },
        { id: 'f589cf89-db7d-4422-9722-553233ac5135', label: 'PBI Cone Test', value: 'f589cf89-db7d-4422-9722-553233ac5135' },
      ];

  const reportOptions: DropdownOption[] = reports
    ? reports.map((report) => ({
        id: report.id,
        label: report.name,
        value: report.id,
      }))
    : [];

  // Fetch reports when workspace selection changes
  useEffect(() => {
    if (selectedWorkspaces.length > 0) {
      // Fetch reports for the first selected workspace
      const workspaceId = selectedWorkspaces[0].toString();
      getReports(workspaceId);
    } else {
      // Clear reports if no workspace is selected
      setSelectedReports([]);
    }
  }, [selectedWorkspaces, getReports]);

  const handleScan = async () => {
    if (selectedWorkspaces.length === 0 || selectedReports.length === 0) {
      alert('Please select at least one workspace and one report');
      return;
    }

    try {
      const result = await scanForWidgets({
        workspaceIds: selectedWorkspaces.map(id => id.toString()),
        reportIds: selectedReports.map(id => id.toString()),
      }).unwrap();
      
      console.log('Scan successful:', result);
      setScanResults(result);
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Failed to scan for widgets. Please try again.');
    }
  };
  const handleReset = () => {
    setSelectedReports([]);
    setSelectedWorkspaces([]);
    setScanResults(null);
  };

  const handleDownloadExcel = async () => {
    if (!scanResults?.excelFileId) {
      alert('No Excel file available to download');
      return;
    }

    try {
      const result = await downloadExcel(scanResults.excelFileId).unwrap();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `widget_scan_results_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  // Extract unique emails from scan results
  // Extract unique emails from scan results
  const uniqueEmails = scanResults
    ? Array.from(
        new Set(
          scanResults.summary
            .map((item) => item.Report_Owners.split(';'))
            .flat()
            .filter((email) => email.trim())
        )
      )
    : [];

  // Build accordion data from scan results
  const accordionData: AccordionItem[] = isScanning
    ? [
        {
          id: 1,
          title: 'Pipeline',
          type: 'pipeline',
          data: {
            status: 'loading',
            downloads: [{ progress: '', name: 'Starting pipeline...' }],
          },
        },
        {
          id: 2,
          title: 'Views',
          type: 'views',
          data: {
            status: 'loading',
            summaryReports: [],
            detailedReports: [],
          },
        },
        {
          id: 3,
          title: 'Email Users',
          type: 'email',
          data: {
            status: 'loading',
            emails: [],
          },
        },
      ]
    : scanResults
    ? [
        {
          id: 1,
          title: 'Pipeline',
          type: 'pipeline',
          data: {
            status: 'complete',
            downloads: scanResults.summary.map((item, index) => ({
              progress: `${index + 1}/${scanResults.summary.length}`,
              name: item.Report_Name,
            })),
          },
        },
        {
          id: 2,
          title: 'Views',
          type: 'views',
          data: {
            status: 'complete',
            summaryReports: scanResults.summary.map((item, index) => ({
              id: (index + 1).toString().padStart(2, '0'),
              workspaceName: item.Workspace_Name,
              workspaceColor: index % 2 === 0 ? 'yellow' : 'green',
              reportName: item.Report_Name,
              widgetCount: item.External_Widgets_Count,
              owners: item.Report_Owners.replace(/;/g, ', '),
            })),
            detailedReports: scanResults.details?.length > 0 
              ? scanResults.details.map((detail) => ({
                  workspaceName: detail.Workspace_Name,
                  reportName: detail.Report_Name,
                  widgetShort: detail.Installed_Widgets_Short,
                  customVisual: detail['Custom Visual'],
                  publisher: detail.Publisher,
                  version: detail.Version,
                  isCertified: detail['Is Certified'],
                }))
              : [],
          },
        },
        {
          id: 3,
          title: 'Email Users',
          type: 'email',
          data: {
            status: 'complete',
            emails: uniqueEmails,
          },
        },
      ]
    : [];

    console.log("Accordion Data:", accordionData);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header />
      <main className="max-w-[1920px] mx-auto px-6 pb-8 bg-[#F6F6F6]">
        {/* Main content will go here */}
        <div className="bg-white rounded-2xl shadow-sm py-12 px-16">
          <p className="text-[#1E1E1E] text-[32px] mb-8">PBI External Widget Checker</p>
          <div className='flex gap-4 mb-6'>
             <Dropdown
            label="Select Workspace"
            options={workspaceOptions}
            selectedValues={selectedWorkspaces}
            onChange={setSelectedWorkspaces}
            placeholder={isLoadingWorkspaces ? 'Loading workspaces...' : 'Choose an option'}
            multiSelect={false}
            showTags={true}
            tagColor="red"
            className="w-[50%]"
          />
          <Dropdown
            label="Select Reports"
            options={reportOptions}
            selectedValues={selectedReports}
            onChange={setSelectedReports}
            placeholder={isLoadingReports ? 'Loading reports...' : selectedWorkspaces.length === 0 ? 'Select a workspace first' : 'Choose reports'}
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
              onClick={handleScan}
              disabled={isScanning || selectedWorkspaces.length === 0 || selectedReports.length === 0}
            //   icon={Search}
              iconPosition="left"
            >
              {isScanning ? 'Scanning...' : 'Scan for widgets'}
            </Button>
          </div>

          {/* Output Section */}
           <h3 className="text-sm font-semibold text-[#6E7C87] mb-2">Output</h3>
          <section id="output" className="mt-4 bg-[#F6F6F6] rounded-lg p-3 max-h-[400px] overflow-y-auto mb-6 border border-[#1E1E1E]">
           {isScanning || scanResults ? (
            <Accordion items={accordionData} allowMultiple={true} />
           ) : (
            <p className="text-center text-[#6E7C87] py-8">No scan results yet. Please select workspaces and reports, then click "Scan for widgets".</p>
           )}
          </section>
          <div className='flex-row-reverse flex'>
            <Button 
              variant="filled" 
              color="danger" 
              onClick={handleDownloadExcel}
              disabled={isScanning || !scanResults?.excelFileId || isDownloading}
            //   icon={Search}
              iconPosition="left"
            >
              {isDownloading ? 'Downloading...' : 'Download as Excel'}
            </Button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
