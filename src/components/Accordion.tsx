import { useState } from 'react';
import { ChevronDown, Loader, CheckCircle2, Mail } from 'lucide-react';

export interface AccordionItem {
  id: string | number;
  title: string;
  content?: string | React.ReactNode;
  type?: 'pipeline' | 'views' | 'email';
  data?: any;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState<(string | number)[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');

  const toggleItem = (id: string | number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const isOpen = (id: string | number) => openItems.includes(id);

  const renderIcon = (type?: string, status?: string) => {
    if (type === 'pipeline') {
      return status === 'loading' ? (
        <Loader size={20} className="text-black animate-spin" />
      ) : (
        <CheckCircle2 size={20} className="text-green-600" />
      );
    }
    if (type === 'views') {
      return <Loader size={20} className="text-black animate-spin" />;
    }
    if (type === 'email') {
      return <Mail size={20} className="text-gray-600" />;
    }
    return null;
  };

  const renderPipelineContent = (data: any) => {
    if (!data?.downloads) return null;
    
    return (
      <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {data.downloads.map((item: any, index: number) => (
          <div key={index} className="text-sm text-gray-700 font-mono">
            Downloading {item.progress}: {item.name}
          </div>
        ))}
      </div>
    );
  };

  const renderViewsContent = (data: any) => {
    console.log("=== RENDER VIEWS CONTENT ===");
    console.log("Data received:", data);
    console.log("summaryReports:", data?.summaryReports);
    console.log("summaryReports length:", data?.summaryReports?.length);
    
    if (!data?.summaryReports && !data?.detailedReports) {
      console.log("NO DATA - returning null");
      return null;
    }

    return (
      <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-2 text-sm font-medium ${
              activeTab === 'summary' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-500'
            }`}
          >
            Summary View
          </button>
          <button 
            onClick={() => setActiveTab('detailed')}
            className={`pb-2 text-sm font-medium ${
              activeTab === 'detailed' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-500'
            }`}
          >
            Detailed View
          </button>
        </div>

        {/* Summary Table */}
        {activeTab === 'summary' && data?.summaryReports && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 sticky top-10 bg-white">
                <tr className="text-left">
                  <th className="pb-3 font-medium text-gray-600 w-16">ID ↑</th>
                  <th className="pb-3 font-medium text-gray-600 w-40">Workspace Name</th>
                  <th className="pb-3 font-medium text-gray-600 w-48">Report Name</th>
                  <th className="pb-3 font-medium text-gray-600 w-32">Ext_Widget_Count</th>
                  <th className="pb-3 font-medium text-gray-600">Report_Owners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.summaryReports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-700">{report.id}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        report.workspaceColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {report.workspaceName}
                      </span>
                    </td>
                    <td className="py-3">
                      <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                        {report.reportName}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 6.66667V10C10 10.1768 9.92976 10.3464 9.80474 10.4714C9.67971 10.5964 9.51014 10.6667 9.33333 10.6667H2C1.82319 10.6667 1.65362 10.5964 1.5286 10.4714C1.40357 10.3464 1.33333 10.1768 1.33333 10V2.66667C1.33333 2.48986 1.40357 2.32029 1.5286 2.19526C1.65362 2.07024 1.82319 2 2 2H5.33333M8 1.33333H10.6667V4M5.66667 6.33333L10.6667 1.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </td>
                    <td className="py-3 text-gray-700">{report.widgetCount}</td>
                    <td className="py-3 text-blue-600">{report.owners}</td>
                  </tr>
                ))}
                
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Table */}
        {activeTab === 'detailed' && data?.detailedReports && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 sticky top-10 bg-white">
                <tr className="text-left">
                  <th className="pb-3 font-medium text-gray-600 w-16">ID ↑</th>
                  <th className="pb-3 font-medium text-gray-600 w-40">Workspace</th>
                  <th className="pb-3 font-medium text-gray-600 w-48">Report</th>
                  <th className="pb-3 font-medium text-gray-600 w-32">Widget</th>
                  <th className="pb-3 font-medium text-gray-600 w-32">Custom Visual</th>
                  <th className="pb-3 font-medium text-gray-600 w-32">Publisher</th>
                  <th className="pb-3 font-medium text-gray-600 w-24">Version</th>
                  <th className="pb-3 font-medium text-gray-600 w-28">Is Certified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.detailedReports.map((detail: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-700">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        index % 2 === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {detail.workspaceName}
                      </span>
                    </td>
                    <td className="py-3">
                      <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                        {detail.reportName}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 6.66667V10C10 10.1768 9.92976 10.3464 9.80474 10.4714C9.67971 10.5964 9.51014 10.6667 9.33333 10.6667H2C1.82319 10.6667 1.65362 10.5964 1.5286 10.4714C1.40357 10.3464 1.33333 10.1768 1.33333 10V2.66667C1.33333 2.48986 1.40357 2.32029 1.5286 2.19526C1.65362 2.07024 1.82319 2 2 2H5.33333M8 1.33333H10.6667V4M5.66667 6.33333L10.6667 1.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </td>
                    <td className="py-3 text-gray-700">{detail.widgetShort}</td>
                    <td className="py-3 text-gray-700">{detail.customVisual}</td>
                    <td className="py-3 text-gray-700">{detail.publisher}</td>
                    <td className="py-3 text-gray-700">{detail.version}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        detail.isCertified === 'Certified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {detail.isCertified}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderEmailContent = (data: any) => {
    if (!data?.emails) return null;

    return (
      <div className="text-sm text-gray-700 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <p className="mb-2">The following users will be notified:</p>
        <div className="space-y-1">
          {data.emails.map((email: string, index: number) => (
            <div key={index} className="text-blue-600">{email}</div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const itemType = item.type || 'default';
        const itemStatus = item.data?.status;
        
        return (
          <div
            key={item.id}
            className="border border-[#1E1E1E] rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between px-2 pt-2 pb-1 text-left "
            >
              <div className="flex items-center gap-2">
                {renderIcon(itemType, itemStatus)}
                <span className="font-normal text-gray-900">{item.title}</span>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform duration-200 ${
                  isOpen(item.id) ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen(item.id) && (
              <div className="">
                <div className="px-6 py-2">
                  {itemType === 'pipeline' && renderPipelineContent(item.data)}
                  {itemType === 'views' && renderViewsContent(item.data)}
                  {itemType === 'email' && renderEmailContent(item.data)}
                  {!itemType || itemType === 'default' ? item.content : null}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
