"use client";

import {
  Button,
  Card,
  CardFooter,
  Image,
  Modal,
  ModalBody,
  ModalContent,
} from "@nextui-org/react";
import React, { Fragment, useState } from "react";

import NextImage from "next/image";
import { UploadButton } from "@/utils/uploadthing";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { CircleCheckIcon, CircleIcon, CircleXIcon } from "lucide-react";

import ImageNotFound from "@/../public/image-not-found.png";

interface ImagePickerProps {
  imageId?: string | null;
  setImageId: (imageId: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ imageId, setImageId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: images, refetch } = api.content.getAllImages.useQuery();
  const currentImage = images?.find((image) => image.id === imageId);

  return (
    <Fragment>
      <div className="m-3 flex w-32 flex-col gap-2">
        <Image
          as={NextImage}
          src={currentImage?.url ?? ImageNotFound.src}
          className="object-cover"
          height={128}
          width={128}
          alt="Image preview"
        />
        <Button onClick={() => setModalOpen(true)}>Pick image</Button>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContent>
          <ModalBody>
            <div className="grid grid-cols-3 gap-1">
              {images?.map((image) => (
                <Card key={image.id}>
                  <Image
                    as={NextImage}
                    key={image.id}
                    src={image.url}
                    className="object-cover"
                    height={128}
                    width={128}
                    alt=""
                  />
                  <CardFooter className="absolute bottom-0 z-10 justify-between">
                    <Button
                      isIconOnly
                      size="sm"
                      onClick={() => {
                        setImageId(image.id);
                        setModalOpen(false);
                      }}
                      {...(image.id === imageId ? { color: "success" } : {})}
                    >
                      {image.id === imageId ? (
                        <CircleCheckIcon />
                      ) : (
                        <CircleIcon />
                      )}
                    </Button>
                    <Button isIconOnly size="sm" color="danger">
                      <CircleXIcon />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={async () => {
                toast.success("Image uploaded!");
                await refetch();
              }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};

export default ImagePicker;
