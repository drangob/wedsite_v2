import { api } from "@/trpc/react";
import {
  Button,
  Input,
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
}

const NewContentModal = ({ isOpen, onClose }: NewContentModalProps) => {
  const [disabled, setDisabled] = useState(false);
  const { mutate } = api.content.createContent.useMutation({
    onMutate: () => setDisabled(true),
    onSuccess: () => {
      toast.success("Content created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => setDisabled(false),
  });
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>New Content</ModalHeader>
        <ModalBody className="flex flex-col gap-2 pb-4">
          <Input
            type="text"
            placeholder="Slug"
            onChange={(e) => setSlug(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button isDisabled={disabled} onClick={() => mutate({ slug, title })}>
            Create
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewContentModal;
