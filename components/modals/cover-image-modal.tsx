"use client"

import { useCoverImage } from "@/hooks/use-cover-image"
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const CoverImageModal = () => {
    const coverImage = useCoverImage();
    const params = useParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [file, setFile] = useState<File>();
    const [submitting, setIsSubmitting] = useState(false);

    const update = useMutation(api.documents.update);
    const { edgestore } = useEdgeStore();

    const onClose = () => {
        setFile(undefined);
        setIsSubmitting(false);
        coverImage.onClose(); 
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        try {
            setIsSubmitting(true);
            setFile(selectedFile);

            const res = await edgestore.publicFiles.upload({
                file: selectedFile,
            });

            await update({
                id: params.documentId as Id<"documents">,
                coverImage: res.url,
            });

            onClose();
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
            <DialogContent>
                <DialogHeader>
                    <h2 className="text-center text-lg font-semibold">
                        Cover Image
                    </h2>
                </DialogHeader>

                <div>
                    <input
                        type="file"
                        onChange={onFileChange}
                        disabled={submitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
