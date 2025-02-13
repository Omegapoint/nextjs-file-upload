"use client";
export default function Home() {
  /* const handleFormSubmit = async (formData: FormData) => {
    const file = formData.get("file") as File; // Cast to File

    if (file && file instanceof File) {
      const stream = file.stream();
      const reader = stream.getReader();

      async function readChunks() {
        let chunkIndex = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            console.log(`Sending chunk ${chunkIndex}...`);
            await fetch("/psm/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "X-Chunk-Index": chunkIndex.toString(),
                "X-File-Name": file.name,
              },
              body: value,
            });

            console.log(`Chunk ${chunkIndex} sent.`);
            chunkIndex++;
          }
        }

        console.log("All chunks uploaded.");
      }

      readChunks().catch((error) => console.error("Upload failed:", error));
    }
  }; */
  /* const handleFormSubmit = async (formData: FormData) => {
    const file = formData.get("file") as File;
    const CHUNK_SIZE = 1024 * 1024 * 1024;
    if (file && file instanceof File) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}...`);

        try {
          await fetch("/psm/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Chunk-Index": chunkIndex.toString(),
              "X-File-Name": file.name,
            },
            body: chunk,
          });

          console.log(`Chunk ${chunkIndex + 1} uploaded.`);
        } catch (error) {
          console.error(`Upload failed for chunk ${chunkIndex + 1}:`, error);
          break;
        }
      }

      console.log("All chunks uploaded.");
    }
  }; */
  /* const handleFormSubmit = async (formData: FormData) => {
    const file = formData.get("file") as File;
    const CHUNK_SIZE = 1024 * 1024 * 1024;
    const MAX_CONCURRENT_UPLOADS = 10;

    if (file && file instanceof File) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const chunkPromises: Promise<Response>[] = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}...`);

        const uploadPromise = fetch("/psm/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Chunk-Index": chunkIndex.toString(),
            "X-File-Name": file.name,
          },
          body: chunk,
        })
          .then((response) => {
            console.log(`Chunk ${chunkIndex + 1} uploaded.`);
            return response; // Ensure we return a Response object
          })
          .catch((error) => {
            console.error(`Upload failed for chunk ${chunkIndex + 1}:`, error);
            throw error; // Propagate error
          });

        chunkPromises.push(uploadPromise);

        if (chunkPromises.length >= MAX_CONCURRENT_UPLOADS) {
          await Promise.all(chunkPromises);
          chunkPromises.length = 0; // Clear completed promises
        }
      }

      await Promise.all(chunkPromises); // Wait for any remaining uploads
      console.log("All chunks uploaded.");
    }
  }; */
  const handleFormSubmit = async (formData: FormData) => {
    const file = formData.get("file") as File;
    const name = formData.get("name");
    const email = formData.get("email");
    console.log("name", name);
    console.log("email", email);
    const CHUNK_SIZE = 1024 * 1024 * 100; // 100MB chunks (adjust if needed)
    const MAX_CONCURRENT_UPLOADS = 10; // Number of parallel uploads
    const RETRY_LIMIT = 3; // Number of retries for failed uploads

    if (file && file instanceof File) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let activeUploads = 0;
      let currentIndex = 0;
      const uploadQueue: Promise<void>[] = [];

      console.log(
        `Starting upload: ${totalChunks} chunks, ${
          CHUNK_SIZE / (1024 * 1024)
        }MB per chunk`
      );

      const uploadChunk = async (
        chunkIndex: number,
        retryCount = 0
      ): Promise<void> => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}...`);

        try {
          await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Chunk-Index": chunkIndex.toString(),
              "X-File-Name": file.name,
            },
            body: chunk,
          });

          console.log(`Chunk ${chunkIndex + 1} uploaded.`);
        } catch (error) {
          console.error(
            `Upload failed for chunk ${chunkIndex + 1}, attempt ${
              retryCount + 1
            }:`,
            error
          );

          if (retryCount < RETRY_LIMIT) {
            return uploadChunk(chunkIndex, retryCount + 1);
          } else {
            console.error(
              `Chunk ${chunkIndex + 1} failed after ${RETRY_LIMIT} retries.`
            );
            throw error;
          }
        } finally {
          activeUploads--;
          processQueue();
        }
      };

      const processQueue = () => {
        while (
          activeUploads < MAX_CONCURRENT_UPLOADS &&
          currentIndex < totalChunks
        ) {
          uploadQueue.push(uploadChunk(currentIndex));
          activeUploads++;
          currentIndex++;
        }
      };

      processQueue();
      await Promise.all(uploadQueue);
      console.log("All chunks uploaded.");
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl">File upload</h1>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <form
            action={handleFormSubmit}
            className="flex flex-col gap-4 w-full"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="file"
              className="border border-gray-300 rounded-lg p-3 file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-none file:cursor-pointer"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Upload File
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
