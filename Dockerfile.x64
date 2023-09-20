FROM nixos/nix:master

RUN nix-channel --update

RUN nix-env -iA nixpkgs.nodejs nixpkgs.unzip nixpkgs.curl

WORKDIR /src

COPY package*.json *.js ./

RUN npm install --production

RUN curl -sSL "https://gitlab.com/the-resistance/src.eco/-/jobs/artifacts/master/download?job=modules" -o public.zip \
    && unzip public.zip -d public \
    && rm public.zip

CMD ["node", "index.js"]

MAINTAINER R
