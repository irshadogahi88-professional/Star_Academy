import { useAuthStore } from '../../store/useAuthStore'
import { Printer, Phone, CheckCircle, AlertTriangle } from 'lucide-react'

export default function StudentChallan() {
  const { user } = useAuthStore()
  const student = user || {
    fullName: 'Student User',
    rollNo: 'STA-2026-894',
    class: 'XI',
    stream: 'Pre-Medical',
    isApproved: true,
  }

  const challanData = {
    challanNo: 'CH-2026-0814',
    feeType: 'One-Time Session 2026 Admission & Tuition Fee',
    issueDate: '01-08-2026',
    status: (student.feeStatus === 'paid' || student.isApproved) ? 'paid' : 'unpaid',
    admissionFee: 3000,
    sessionTuitionFee: 25000,
    totalAmount: 28000,
    bankName: 'Academy Office / Direct Cash Deposit',
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-white">
            Admission Fee Challan
          </h1>
          <p className="text-xs text-emerald-100/70 mt-1 font-semibold">
            Official One-Time Admission Fee Voucher for Star Educational Academy, Ghotki.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn-gold text-xs shadow-md self-start sm:self-center"
        >
          <Printer size={14} />
          <span>Print Fee Voucher</span>
        </button>
      </div>

      {/* Official Voucher Card */}
      <div className="card-glass !p-8 max-w-3xl mx-auto space-y-6 border border-[#10b981]/25 bg-[#0a1b14]/50 shadow-2xl rounded-3xl print:shadow-none print:border-black print:bg-white print:text-black" id="challan-voucher">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-[#10b981]/20 print:border-black gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Star Academy Logo" className="h-14 w-14 rounded-full border-2 border-amber-500" />
            <div>
              <h2 className="text-xl font-black text-white print:text-black">
                STAR EDUCATIONAL ACADEMY
              </h2>
              <p className="text-xs font-extrabold text-amber-500 tracking-wider uppercase">
                D.A.V. High School, Ladies Bazaar, Ghotki
              </p>
              <p className="text-[11px] font-semibold text-emerald-100/50 print:text-gray-600 flex items-center gap-2 justify-center sm:justify-start mt-0.5">
                <Phone size={10} className="text-emerald-400 print:text-black" /> 0308-3309704 • 0306-3004887
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border ${
              challanData.status === 'paid'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 print:bg-emerald-100 print:text-emerald-800'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/25 print:bg-amber-100 print:text-amber-900'
            }`}>
              {challanData.status === 'paid' ? <><CheckCircle size={12} /> PAID & ACTIVATED</> : <><AlertTriangle size={12} /> PENDING PAYMENT</>}
            </span>
            <p className="text-xs font-mono font-bold text-amber-500 print:text-black mt-2">Challan #: {challanData.challanNo}</p>
          </div>
        </div>

        {/* Student & Bank Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#08140f]/60 border border-[#10b981]/10 text-xs font-semibold text-emerald-100 print:bg-gray-100 print:text-black print:border-gray-300">
          <div className="space-y-1">
            <p><strong className="text-amber-500 print:text-black">Student Name:</strong> {student.fullName}</p>
            <p><strong className="text-amber-500 print:text-black">Roll / Reg ID:</strong> {student.rollNo || 'STA-2026-REG'}</p>
            <p><strong className="text-amber-500 print:text-black">Class & Track:</strong> Grade {student.class || 'XI'} ({student.stream || 'Pre-Medical'})</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p><strong className="text-amber-500 print:text-black">Billing Type:</strong> {challanData.feeType}</p>
            <p><strong className="text-amber-500 print:text-black">Issue Date:</strong> {challanData.issueDate}</p>
          </div>
        </div>

        {/* Fee Itemization Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#060e0a] text-white border-b border-[#10b981]/15 print:bg-black print:text-white">
                <th className="p-3 rounded-tl-xl font-bold">Sr #</th>
                <th className="p-3 font-bold">Fee Particulars</th>
                <th className="p-3 rounded-tr-xl font-bold text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10b981]/10 print:divide-gray-300">
              <tr className="text-emerald-100/80 print:text-black">
                <td className="p-3">1</td>
                <td className="p-3 font-semibold">One-Time Registration & Admission Fee</td>
                <td className="p-3 text-right font-mono font-bold">Rs. {challanData.admissionFee}</td>
              </tr>
              <tr className="text-emerald-100/80 print:text-black">
                <td className="p-3">2</td>
                <td className="p-3 font-semibold">Session 2026 Complete Coaching & Online Portal Fee</td>
                <td className="p-3 text-right font-mono font-bold">Rs. {challanData.sessionTuitionFee}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-emerald-500/5 font-bold text-sm text-emerald-400 print:bg-gray-200 print:text-black">
                <td colSpan={2} className="p-3 text-right">Total One-Time Fee:</td>
                <td className="p-3 text-right font-mono text-base font-black text-emerald-400 print:text-black">
                  Rs. {challanData.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-[#10b981]/15 print:border-black text-[11px] text-emerald-100/50 print:text-gray-600 space-y-1 font-semibold">
          <p className="font-bold text-amber-500 print:text-black">Payment Instructions:</p>
          <p>Please pay this one-time fee challan at Star Educational Academy Office (D.A.V. School, Ghotki).</p>
          <p>Once paid, the clerk or administrator will approve your account, enabling full login access to online tests and lectures.</p>
        </div>
      </div>
    </div>
  )
}
