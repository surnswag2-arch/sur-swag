import apiClient, { withRetry } from "./client";

export interface UploadRequestResult {
  uploadUrl: string;
  videoId: string;
  publicUrl: string;
}

export interface UploadVideoData {
  caption?: string;
  hashtags?: string[];
  sound_id?: string;
  privacy?: "public" | "friends" | "private";
  allow_comments?: boolean;
  allow_duet?: boolean;
  allow_stitch?: boolean;
}

export async function requestUpload(
  fileType: string,
  duration: number,
): Promise<UploadRequestResult> {
  const response = await withRetry(() =>
    apiClient.post<{ upload_url: string; video_id: string; public_url: string }>(
      "/upload/request",
      { file_type: fileType, duration },
    ),
  );

  return {
    uploadUrl: response.data.upload_url,
    videoId: response.data.video_id,
    publicUrl: response.data.public_url,
  };
}

export async function uploadFile(
  uploadUrl: string,
  file: File,
  _onProgress?: (percent: number) => void,
): Promise<void> {
  await withRetry(async () => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response;
  });
}

export async function confirmUpload(
  videoId: string,
  data: UploadVideoData,
): Promise<{ id: string; status: string }> {
  const response = await withRetry(() =>
    apiClient.post<{ id: string; status: string }>("/upload/callback", {
      video_id: videoId,
      ...data,
    }),
  );

  return response.data;
}

export async function createVideo(
  data: UploadVideoData & { r2_key: string; duration: number },
): Promise<{ id: string; status: string }> {
  const response = await withRetry(() =>
    apiClient.post<{ id: string; status: string }>("/upload/create-video", data),
  );

  return response.data;
}

export async function followUser(userId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/users/${userId}/follow`));
}

export async function unfollowUser(userId: string): Promise<void> {
  await withRetry(() => apiClient.delete(`/users/${userId}/follow`));
}
