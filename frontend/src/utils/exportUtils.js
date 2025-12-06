// utils/exportUtils.js

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

function stripUnsupportedColors(node) {
  const elements = node.querySelectorAll('*');
  elements.forEach((el) => {
    const style = getComputedStyle(el);

    ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach((prop) => {
      const value = style[prop];
      if (value.includes('oklch')) {
        el.style.setProperty(prop, '#000', 'important'); // Use a safe fallback
      }
    });

    // Special case: boxShadow can also use oklch colors
    const boxShadow = style.boxShadow;
    if (boxShadow.includes('oklch')) {
      el.style.setProperty('box-shadow', 'none', 'important');
    }
  });
}


export const exportSessionToPDF = async (containerId) => {
  const input = document.getElementById(containerId);
  if (!input) {
    toast.error('Session container not found.');
    return;
  }

  // Force override unsupported oklch colors before rendering
  stripUnsupportedColors(input);

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('Interview_Session.pdf');
    toast.success('PDF exported successfully!');
  } catch (error) {
    console.error('PDF export error:', error);
    toast.error('Failed to export PDF.');
  }
};




//Export as Markdown

export const exportSessionToMarkdown = (session) => {
  let content = `# ${session.title}\n\n${session.desc}\n\n`;

  session.qna.forEach((qa, index) => {
    content += `## Q${index + 1}: ${qa.question}\n\n`;
    qa.answerParts.forEach(part => {
      if (part.type === 'code') {
        content += `\`\`\`${part.language || 'js'}\n${part.content}\n\`\`\`\n\n`;
      } else {
        content += `${part.content}\n\n`;
      }
    });
  });

  const blob = new Blob([content], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${session.title || 'session'}.md`;
  link.click();
};

// Session Sharing
export const copySessionLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  toast.success("Link copy successfully!");
};
