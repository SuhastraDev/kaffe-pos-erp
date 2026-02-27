import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react'; // <-- IMPORT LIBRARY QR CODE

export default function Receipt() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const receiptRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Gagal mengambil data transaksi', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const downloadPDF = async () => {
    const element = receiptRef.current;
    // html2canvas akan otomatis memotret QR Code juga karena kita pakai QRCodeCanvas
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a5');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Struk_${order.order_number}.pdf`);
  };

  if (isLoading) return <div className="p-8 text-center">Memuat struk...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Transaksi tidak ditemukan!</div>;

  // Generate payload unik untuk simulasi QRIS
  const qrisPayload = `DUMMY-QRIS|${order.order_number}|Rp${order.total}`;

  return (
    <div className="min-h-screen bg-gray-200 py-10 flex flex-col items-center overflow-y-auto">
      {/* Kertas Struk */}
      <div 
        ref={receiptRef} 
        className="bg-white p-8 w-[400px] shadow-lg text-gray-800 font-mono text-sm"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">POS KAFE</h1>
          <p>Jl. Teknologi Informatika No. 1</p>
          <p>Telp: 0812-3456-7890</p>
        </div>

        <div className="border-b-2 border-dashed border-gray-400 pb-2 mb-2">
          <p>No Order : {order.order_number}</p>
          <p>Tanggal  : {new Date(order.created_at).toLocaleString('id-ID')}</p>
          <p>Kasir    : {order.user_id}</p>
        </div>

        <div className="mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.name || item.product_name}</td>
                  <td className="py-1 text-center">{item.qty || item.quantity}</td>
                  <td className="py-1 text-right">{Number(item.price ? item.price * (item.qty || item.quantity) : item.subtotal || 0).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-dashed border-gray-400 pt-2 space-y-1">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rp {Number(order.total).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Metode:</span>
            <span className="uppercase font-bold">{order.payment_method}</span>
          </div>
          {order.payment_method === 'cash' && (
            <>
              <div className="flex justify-between">
                <span>Tunai/Bayar:</span>
                <span>Rp {Number(order.amount_paid).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali:</span>
                <span>Rp {Number(order.change_amount).toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
        </div>

        {/* --- AREA QRIS KHUSUS NON-TUNAI --- */}
        {order.payment_method === 'non-cash' && (
          <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400 flex flex-col items-center">
            <p className="font-bold text-base mb-3 tracking-widest">SCAN QRIS</p>
            <div className="p-2 border-4 border-gray-800 rounded-lg bg-white">
              <QRCodeCanvas 
                value={qrisPayload} 
                size={160} 
                level={"H"} // High error correction, bikin QR lebih detail/mirip QRIS asli
              />
            </div>
            <p className="text-xs mt-3 text-center text-gray-500">
              Silakan scan menggunakan M-Banking atau e-Wallet Anda.
            </p>
          </div>
        )}

        <div className="text-center mt-8 pt-4 border-t border-gray-300">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Silakan datang kembali</p>
        </div>
      </div>

      {/* Tombol Aksi (Tidak akan ikut tercetak/download) */}
      <div className="mt-6 flex gap-4">
        <button 
          onClick={downloadPDF} 
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-bold"
        >
          Download PDF
        </button>
        <Link 
          to={user?.role === 'admin' ? '/admin/transactions' : '/kasir/pos'} 
          className="bg-gray-500 text-white px-6 py-2 rounded shadow hover:bg-gray-600 font-bold"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
}