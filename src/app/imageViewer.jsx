"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AWS from "aws-sdk";
import "./globals.css";

const PhotoAlbumViewer = () => {
  const [albums, setAlbums] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);

  useEffect(() => {
    AWS.config.region = "eu-central-1"; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "eu-central-1:31ebe2ab-fc9d-4a2c-96a9-9dee9a9db8b9",
    });

    const albumBucketName = "dataspan.frontend-home-assignment";
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      params: { Bucket: albumBucketName },
    });

    const listAlbums = () => {
      s3.listObjects({ Delimiter: "/" }, (err, data) => {
        if (err) {
          alert("There was an error listing your albums: " + err.message);
        } else {
          const albums = data.CommonPrefixes.map((commonPrefix) => {
            const prefix = commonPrefix.Prefix;
            const albumName = decodeURIComponent(prefix.replace("/", ""));
            return (
              <li key={albumName}>
                <button onClick={() => viewAlbum(albumName)}>
                  {albumName}
                </button>
              </li>
            );
          });

          const message = albums.length ? (
            <p>Click on an album name to view it.</p>
          ) : (
            <p>You do not have any albums. Please Create album.</p>
          );

          const albumList = (
            <div className="viewer-container">
              <h2>Albums</h2>
              {message}
              <ul className="album-list">{albums}</ul>
            </div>
          );

          setAlbums(albumList);
        }
      });
    };

    const viewAlbum = (albumName) => {
      const albumPhotosKey = encodeURIComponent(albumName) + "/";
      s3.listObjects({ Prefix: albumPhotosKey }, (err, data) => {
        if (err) {
          alert("There was an error viewing your album: " + err.message);
        } else {
          const href = this.request.httpRequest.endpoint.href;
          const bucketUrl = href + albumBucketName + "/";

          const photos = data.Contents.map((photo) => {
            const photoKey = photo.Key;
            const photoUrl = bucketUrl + encodeURIComponent(photoKey);
            return (
              <span key={photoKey}>
                <div className="album-view">
                  <Image src={photoUrl} alt={photoKey} />
                  <div>{photoKey.replace(albumPhotosKey, "")}</div>
                </div>
              </span>
            );
          });

          const message = photos.length ? (
            <p>The following photos are present.</p>
          ) : (
            <p>There are no photos in this album.</p>
          );

          const albumView = (
            <div className="viewer-container">
              <button onClick={listAlbums}>Back To Albums</button>
              <h2>Album: {albumName}</h2>
              {message}
              {photos}
              <h2>End of Album: {albumName}</h2>
              <button onClick={listAlbums}>Back To Albums</button>
            </div>
          );

          setCurrentAlbum(albumView);
        }
      });
    };

    listAlbums();
  }, []);

  return (
    <div>
      <h1>Photo Album Viewer</h1>
      <div id="viewer">{currentAlbum ? currentAlbum : albums}</div>
    </div>
  );
};

export default PhotoAlbumViewer;
