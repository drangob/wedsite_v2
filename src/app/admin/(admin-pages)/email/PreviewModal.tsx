import { Modal, ModalBody, ModalContent } from "@nextui-org/react";
import React from "react";

import { prepareEmailBody } from "@/utils/email";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailBody: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  emailBody,
  isOpen,
  onClose,
}) => {
  const preparedEmail = prepareEmailBody(emailBody, {
    name: "John Doe",
    websiteUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://example.com"}?uid=123456`,
    uid: "123456",
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalBody dangerouslySetInnerHTML={{ __html: preparedEmail }} />
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
