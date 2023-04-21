FROM nixos/nix:master

RUN nix-channel --update

RUN nix-env -iA nixpkgs.nodejs

WORKDIR /src

COPY package*.json *.js ./

RUN npm install --production

CMD ["node", "index.js"]

MAINTAINER R