import { useEffect, useState } from "react";

function FileGallery() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/files") // Fetch from backend
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  return (
    <div>
      <h2>Uploaded Files</h2>
      <div>
        {files.map((file, index) => (
          <img key={index} src={file.fileUrl} alt="Uploaded" width="200px" />
        ))}
      </div>
    </div>
  );
}

export default FileGallery;

