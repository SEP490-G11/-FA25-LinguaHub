import  { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Clock } from "lucide-react";
import QRCode from "qrcode";

interface PaymentMethodProps {
  payment: {
    qrCode: string;
    amount: number;
    accountName: string;
    accountNumber: string;
    description: string;
  };
}

const PaymentMethod = ({ payment }: PaymentMethodProps) => {
  const [copied, setCopied] = useState<"" | "acc" | "desc">("");
  const [qrImage, setQrImage] = useState<string>("");

  const copyToClipboard = useCallback((text: string, type: "acc" | "desc") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  }, []);

  //  convert chuỗi qrCode thành ảnh base64
  useEffect(() => {
    QRCode.toDataURL(payment.qrCode, { width: 240 }, (err, url) => {
      if (!err) setQrImage(url);
    });
  }, [payment.qrCode]);

  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
      <motion.div
          className="bg-white rounded-xl p-8 shadow-md"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan to Pay</h2>
          <p className="text-gray-600">Use your banking app to scan the QR code</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-8 mb-6 text-center">
          {/*  Chỉ hiển thị ảnh QR */}
          {qrImage && (
              <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-lg shadow-md"
              />
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Bank Transfer Information</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="text-blue-600 font-bold">{formatPrice(payment.amount)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Number:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{payment.accountNumber}</span>
                <button
                    onClick={() => copyToClipboard(payment.accountNumber, "acc")}
                    className="text-blue-500 hover:text-blue-600"
                >
                  {copied === "acc" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Name:</span>
              <span className="font-medium">{payment.accountName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Transfer Content:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-right">{payment.description}</span>
                <button
                    onClick={() => copyToClipboard(payment.description, "desc")}
                    className="text-blue-500 hover:text-blue-600"
                >
                  {copied === "desc" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium">Waiting for payment confirmation...</span>
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            Payments are usually confirmed within 1–5 minutes.
          </p>
        </div>
      </motion.div>
  );
};

export default PaymentMethod;
