import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex File Storage Helpers
 *
 * Convex provides built-in file storage. Files are stored in Convex's
 * cloud storage and are accessible via URLs.
 *
 * Usage:
 * 1. Get upload URL: const url = await ctx.storage.generateUploadUrl()
 * 2. Upload file to URL from client
 * 3. Store storage ID in document
 * 4. Get public URL: ctx.storage.getUrl(storageId)
 */

// Generate upload URL for client-side file upload
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Store file reference after upload
export const storeFile = mutation({
    args: {
        storageId: v.id("_storage"),
        filename: v.string(),
        contentType: v.string(),
        size: v.number(),
        resourceId: v.optional(v.id("resources")),
    },
    handler: async (ctx, { storageId, filename, contentType, size, resourceId }) => {
        // Get the public URL
        const url = await ctx.storage.getUrl(storageId);

        // If this is for a resource, update the resource's images
        if (resourceId) {
            const resource = await ctx.db.get(resourceId);
            if (resource) {
                const images = resource.images || [];
                images.push({
                    url: url || "",
                    alt: filename,
                    isPrimary: images.length === 0,
                });
                await ctx.db.patch(resourceId, { images });
            }
        }

        return {
            storageId,
            url,
            filename,
            contentType,
            size,
        };
    },
});

// Get file URL by storage ID
export const getFileUrl = query({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, { storageId }) => {
        return await ctx.storage.getUrl(storageId);
    },
});

// Delete a file from storage
export const deleteFile = mutation({
    args: {
        storageId: v.id("_storage"),
        resourceId: v.optional(v.id("resources")),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, { storageId, resourceId, imageUrl }) => {
        // Delete from storage
        await ctx.storage.delete(storageId);

        // If this was attached to a resource, remove from images array
        if (resourceId && imageUrl) {
            const resource = await ctx.db.get(resourceId);
            if (resource) {
                const images = (resource.images || []).filter(
                    (img: { url: string }) => img.url !== imageUrl
                );
                await ctx.db.patch(resourceId, { images });
            }
        }

        return { success: true };
    },
});

// Bulk upload action - for seeding images from URLs
export const seedImagesFromUrls = action({
    args: {
        resourceId: v.id("resources"),
        imageUrls: v.array(
            v.object({
                url: v.string(),
                alt: v.string(),
                isPrimary: v.boolean(),
            })
        ),
    },
    handler: async (ctx, { resourceId, imageUrls }) => {
        // For each external URL, fetch and upload to Convex storage
        const uploadedImages = [];

        for (const image of imageUrls) {
            try {
                // Fetch the image
                const response = await fetch(image.url);
                if (!response.ok) {
                    console.log(`Failed to fetch ${image.url}`);
                    continue;
                }

                const blob = await response.blob();

                // Get upload URL
                const uploadUrl = await ctx.storage.generateUploadUrl();

                // Upload to Convex
                const uploadResponse = await fetch(uploadUrl, {
                    method: "POST",
                    body: blob,
                    headers: {
                        "Content-Type": blob.type,
                    },
                });

                if (!uploadResponse.ok) {
                    console.log(`Failed to upload ${image.url}`);
                    continue;
                }

                const { storageId } = await uploadResponse.json();
                const storedUrl = await ctx.storage.getUrl(storageId);

                uploadedImages.push({
                    url: storedUrl,
                    alt: image.alt,
                    isPrimary: image.isPrimary,
                    storageId,
                });
            } catch (error) {
                console.error(`Error processing ${image.url}:`, error);
            }
        }

        return {
            resourceId,
            uploaded: uploadedImages.length,
            images: uploadedImages,
        };
    },
});
