"use client";

import { Select, SelectItem } from "@nextui-org/react";
import dynamic from "next/dynamic";

const HTMLEditor = dynamic(() => import("./HTMLEditor"), {
  ssr: false,
});

import React from "react";
import toast from "react-hot-toast";

export default function Content() {
  const onSave = async (data: string) => {
    const saving = toast.loading("Saving...");
    setTimeout(() => {
      console.log(data);
      console.log("Saved");
      toast.dismiss(saving);
      toast.success("Saved");
    }, 1000);
  };
  return (
    <>
      <h1 className="text-xl font-bold">Content</h1>
      <p>Here you will be able to view and edit the content of the website.</p>
      <Select>
        <SelectItem key="1">Option 1</SelectItem>
        <SelectItem key="2">Option 2</SelectItem>
        <SelectItem key="3">Option 3</SelectItem>
      </Select>
      <HTMLEditor onSave={onSave} initialData="banana" />
    </>
  );
}
