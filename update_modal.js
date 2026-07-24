const fs = require('fs');
const p = 'c:/Users/cepal/Documents/01_Dev/agentic_projects/antigravityPG/Lumina_Health/components/patients/AddPatientModal.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  '    <div \n      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"\n      onClick={onClose}\n    >\n      <div \n        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh] my-auto overflow-hidden relative"\n        onClick={(e) => e.stopPropagation()}\n      >',
  `    <div \n      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 m-0 overflow-hidden"\n      onClick={onClose}\n    >\n      <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white text-slate-500 hover:text-slate-800 shadow-md border border-slate-200 transition-all z-20"><X className="w-5 h-5" /></button>\n      <div \n        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh] m-0 my-auto relative overflow-hidden"\n        onClick={(e) => e.stopPropagation()}\n      >`
);

c = c.replace(
  '        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">\n          <div className="flex items-center gap-2.5">\n            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">\n              <UserPlus className="w-5 h-5" />\n            </div>\n            <div>\n              <h2 className="text-lg font-bold text-slate-900">Add New Patient Intake</h2>\n              <p className="text-xs text-slate-500">All fields marked with <span className="text-rose-500 font-bold">*</span> are required</p>\n            </div>\n          </div>\n          <button \n            onClick={onClose}\n            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"\n          >\n            <X className="w-5 h-5" />\n          </button>\n        </div>',
  `        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-4 shrink-0">\n          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">\n            <UserPlus className="w-5 h-5" />\n          </div>\n          <h2 className="text-lg font-bold text-slate-900">Add New Patient Intake</h2>\n        </div>`
);

c = c.replace(
  '<form onSubmit={handleSubmit} className="flex flex-col">\n          <div className="overflow-y-auto max-h-[calc(85vh-140px)] space-y-4 pr-1.5 [scrollbar-width:thin]">',
  `<form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">\n          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1.5 py-1 [scrollbar-width:thin]">`
);

c = c.replace(
  '          </div>\n          {/* Form Actions */}\n          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100 shrink-0">',
  `          </div>\n          {/* Form Actions */}\n          <div className="flex items-center justify-end gap-3 pt-4 mt-auto border-t border-slate-100 shrink-0">`
);

fs.writeFileSync(p, c, 'utf8');
console.log('done');
