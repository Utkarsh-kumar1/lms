import React, { useEffect, useState } from "react";

const PdfViewer = ({ fileUrl }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the device is mobile
//   const isMobileDevice = () => {
//     return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//       navigator.userAgent
//     );
//   };

//   useEffect(() => {
//     setIsMobile(isMobileDevice());

//     if (isMobileDevice()) {
//       // Open the PDF in a new window on mobile, or show a message
//       window.open(fileUrl, "_blank");
//     }
//   }, [fileUrl]);

  //   if (isMobile) {
  //     return (
  //       <div className="text-center text-lg font-semibold">
  //         The PDF is opened in a new tab on mobile.
  //       </div>
  //     );
  //   }

  return (
    <div className="w-full h-screen">
      <object data={fileUrl} type="application/pdf" width="100%" height="100%">
        {/* <p>
          Your browser doesn't support viewing PDFs inline. You can{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            download the PDF here
          </a>
          .
        </p> */}
      </object>
    </div>
  );
};

export default PdfViewer;
