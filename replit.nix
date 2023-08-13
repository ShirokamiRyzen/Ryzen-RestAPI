{ pkgs }: {
	deps = with pkgs; [
		nodejs-18_x
		nodePackages.typescript-language-server
		nodePackages.node-pre-gyp
		libpng
		libjpeg
		libuuid
	];
env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid];  };
}