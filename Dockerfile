FROM g2gml/pg:0.3.4

RUN cd /opt \
 && wget http://ftp.jaist.ac.jp/pub/apache/jena/binaries/apache-jena-3.13.1.zip \
 && unzip apache-jena-3.13.1.zip
ENV PATH $PATH:/opt/apache-jena-3.13.1/bin

RUN cd /opt \
 && git clone -b v0.3.6 https://github.com/g2glab/g2g.git \
 && cd g2g \
 && npm install \
 && npm link

WORKDIR /work
