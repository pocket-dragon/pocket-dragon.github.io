export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "dist-offline/index.html",
            name: "pocket-dragon.html",
            label: "Pocket Dragon — offline version (download and open in a browser)",
          },
        ],
        // The release job's Report-failure step already opens a deploy-failure
        // issue; the plugin's own failure issue would duplicate it.
        failCommentCondition: false,
      },
    ],
  ],
};
