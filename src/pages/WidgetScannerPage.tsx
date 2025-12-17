import { useState, useEffect } from 'react';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import Header from '../components/Header';
import Button from '../components/Button';
import Accordion, { type AccordionItem } from '../components/Accordion';
import { useGetWorkspacesQuery, useLazyGetReportsByWorkspaceQuery, useScanForWidgetsMutation, useLazyDownloadExcelQuery, useSendEmailMutation, type ScanResponse } from '../store/slices/apiSlice';


export default function WidgetScannerPage() {
  const [selectedReports, setSelectedReports] = useState<(string | number)[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<(string | number)[]>([]);
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null);
  const [allReports, setAllReports] = useState<DropdownOption[]>([]);
  const [workspaceReportsMap, setWorkspaceReportsMap] = useState<Map<string, string[]>>(new Map());
  const [fetchedWorkspaces, setFetchedWorkspaces] = useState<Set<string>>(new Set());
  const [isEmailPreviewExpanded, setIsEmailPreviewExpanded] = useState(false);
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspacesQuery();
  const [getReports, { isLoading: isLoadingReports }] = useLazyGetReportsByWorkspaceQuery();
  const [scanForWidgets, { isLoading: isScanning }] = useScanForWidgetsMutation();
  const [downloadExcel, { isLoading: isDownloading }] = useLazyDownloadExcelQuery();
  const [sendEmail, { isLoading: isSendingEmail }] = useSendEmailMutation();



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

  // Fetch reports when workspace selection changes
  useEffect(() => {
    if (selectedWorkspaces.length > 0) {
      const selectedWorkspaceIds = new Set(selectedWorkspaces.map(id => id.toString()));
      
      // Fetch reports for newly selected workspaces
     selectedWorkspaces.map(async (workspaceId) => {
        const workspaceIdStr = workspaceId.toString();
        if (!fetchedWorkspaces.has(workspaceIdStr)) {
          try {
            const result = await getReports(workspaceIdStr).unwrap();
            
            if (result && result.length > 0) {
              const newReports = result.map((report) => ({
                id: report.id,
                label: report.name,
                value: report.id,
              }));

              const reportIds = result.map(report => report.id);

              setAllReports((prevReports) => {
                const existingIds = new Set(prevReports.map((r) => r.id));
                const uniqueNewReports = newReports.filter((r) => !existingIds.has(r.id));
                return [...prevReports, ...uniqueNewReports];
              });

              setWorkspaceReportsMap(prev => new Map(prev).set(workspaceIdStr, reportIds));
              setFetchedWorkspaces((prev) => new Set([...prev, workspaceIdStr]));
            }
          } catch (error) {
            console.error(`Failed to fetch reports for workspace ${workspaceIdStr}:`, error);
          }
        }
      });

      // Remove reports from deselected workspaces
      const deselectedWorkspaces = Array.from(fetchedWorkspaces).filter(
        wsId => !selectedWorkspaceIds.has(wsId)
      );

      if (deselectedWorkspaces.length > 0) {
        const reportsToRemove = new Set<string>();
        deselectedWorkspaces.forEach(wsId => {
          const reportIds = workspaceReportsMap.get(wsId) || [];
          reportIds.forEach(reportId => reportsToRemove.add(reportId));
        });

        setAllReports(prev => prev.filter(report => !reportsToRemove.has(report.id.toString())));

        setWorkspaceReportsMap(prev => {
          const newMap = new Map(prev);
          deselectedWorkspaces.forEach(wsId => newMap.delete(wsId));
          return newMap;
        });

        setFetchedWorkspaces(prev => {
          const newSet = new Set(prev);
          deselectedWorkspaces.forEach(wsId => newSet.delete(wsId));
          return newSet;
        });

        setSelectedReports(prev => 
          prev.filter(reportId => !reportsToRemove.has(reportId.toString()))
        );
      }
    } else {
      setAllReports([]);
      setWorkspaceReportsMap(new Map());
      setFetchedWorkspaces(new Set());
      setSelectedReports([]);
      setScanResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspaces]);

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
    setAllReports([]);
    setWorkspaceReportsMap(new Map());
    setFetchedWorkspaces(new Set());
  };

  const handleSelectAllReports = () => {
    const allReportIds = allReports.map(report => report.id);
    setSelectedReports(allReportIds);
  };

  const handleDeselectAllReports = () => {
    setSelectedReports([]);
  };

  // console.log("Scan Results:", isScanning || isSendingEmail || uniqueEmails.length === 0 || !scanResults?.outCsvSum || !scanResults?.outCsvFriendly);


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
            downloads: selectedReports.map((reportId, index) => {
              const report = allReports.find(r => r.id === reportId);
              return {
                progress: `${index + 1}/${selectedReports.length}`,
                name: report?.label || 'Unknown Report',
              };
            }),
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
      ]
    : [];

  const handleSendEmail = async () => {
    
    if (!scanResults?.summary_path || !scanResults?.friendly_path) {
      alert('No scan results available to send email');
      return;
    }

    try {
      await sendEmail({
        outCsvSum: scanResults.summary_path,
        outCsvFriendly: scanResults.friendly_path,
      }).unwrap();
      
      console.log('Email sent successfully to:', uniqueEmails);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

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
            multiSelect={true}
            showTags={true}
            tagColor="red"
            className="w-[50%]"
          />
          <div className="w-[50%]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#6E7C87] text-sm leading-6 ml-2">
                Select Reports
              </label>
              {allReports.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllReports}
                    className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                    disabled={selectedReports.length === allReports.length}
                  >
                    Select All
                  </button>
                  <span className="text-xs text-gray-400">|</span>
                  <button
                    onClick={handleDeselectAllReports}
                    className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                    disabled={selectedReports.length === 0}
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>
            <Dropdown
              options={allReports}
              selectedValues={selectedReports}
              onChange={setSelectedReports}
              placeholder={isLoadingReports ? 'Loading reports...' : selectedWorkspaces.length === 0 ? 'Select a workspace first' : 'Choose reports'}
              multiSelect={true}
              showTags={true}
              tagColor="red"
            />
          </div>
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

          {/* Email Preview Section */}
          {scanResults && (
            <>
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsEmailPreviewExpanded(!isEmailPreviewExpanded)}
              >
                <h3 className="text-sm font-semibold text-[#6E7C87]">Email Preview</h3>
                <svg 
                  className={`w-5 h-5 text-[#6E7C87] transition-transform ${isEmailPreviewExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isEmailPreviewExpanded && (
                <section className="mt-4 bg-[#F6F6F6] rounded-lg p-6 mb-6 border border-[#1E1E1E]">
                  <div className="space-y-4">
                    {scanResults.emailPreview ? (
                      <>
                        {(() => {
                          // Split by double newline to separate header from body
                          const parts = scanResults.emailPreview.split('\n\n');
                          // First two parts are the greeting and intro message
                          const header = parts.slice(0, 2).join('\n\n');
                          // Rest is the body content
                          const body = parts.slice(2).join('\n\n');
                          
                          return (
                            <>
                              <div className="mb-4 text-gray-800 whitespace-pre-line text-sm">
                                {header}
                              </div>
                              <div className="whitespace-pre-wrap font-mono text-xs bg-white p-4 rounded border border-gray-200">
                                {body}
                              </div>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 mb-2">The following users will be notified:</p>
                        <div className="space-y-1">
                          {uniqueEmails.map((email: string, index: number) => (
                            <div key={index} className="text-sm text-blue-600">{email}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          <div className='flex justify-between gap-4'>
            <Button 
              variant="filled" 
              color="danger" 
              onClick={handleSendEmail}
              disabled={isScanning || isSendingEmail || uniqueEmails.length === 0 || !scanResults?.summary_path || !scanResults?.friendly_path}
              iconPosition="left"
            >
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
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
