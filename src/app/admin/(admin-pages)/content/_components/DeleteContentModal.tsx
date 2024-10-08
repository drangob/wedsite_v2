import { api } from "@/trpc/react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface NewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlug: string;
  setSelectedSlug: (slug: string | undefined) => void;
}

const DeleteContentModal = ({
  isOpen,
  onClose,
  selectedSlug,
  setSelectedSlug,
}: NewContentModalProps) => {
  const [disabled, setDisabled] = useState(false);
  const { mutate } = api.content.deleteContent.useMutation({
    onMutate: () => setDisabled(true),
    onSuccess: () => {
      toast.success("Content deleted successfully");
      setSelectedSlug(undefined);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => setDisabled(false),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalBody className="flex flex-row gap-2 pb-4">
          Clicking delete will permanently delete the content with the slug{" "}
          &apos;{selectedSlug}&apos;.
          <Button
            isDisabled={disabled}
            color="danger"
            onClick={() => mutate(selectedSlug)}
          >
            Delete
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DeleteContentModal;
