
import axios from "axios";
import FormData from "form-data";

export const uploadToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  formData.append("pinataMetadata", JSON.stringify({
    name: file.name,
  }));
  
  formData.append("pinataOptions", JSON.stringify({
    cidVersion: 0,
  }));

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      }
    );
    return `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    return null;
  }
};