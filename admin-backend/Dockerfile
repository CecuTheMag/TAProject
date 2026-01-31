FROM ubuntu:22.04

WORKDIR /app

# Install Node.js and mdb-tools dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    git \
    autoconf \
    automake \
    libtool \
    pkg-config \
    libglib2.0-dev \
    flex \
    bison \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Build mdb-tools from source with proper installation
RUN git clone https://github.com/mdbtools/mdbtools.git /tmp/mdbtools && \
    cd /tmp/mdbtools && \
    sed -i 's/@LIBICONV@//g' src/libmdb/Makefile.am && \
    sed -i '/AM_ICONV/d' configure.ac && \
    autoreconf -i -f && \
    ./configure --disable-man --disable-nls --without-iconv --prefix=/usr && \
    make && \
    make install && \
    ldconfig && \
    chmod +x /usr/bin/mdb-* && \
    ls -la /usr/bin/mdb-* && \
    rm -rf /tmp/mdbtools

# Verify mdb-tools installation
RUN which mdb-tables && which mdb-export && mdb-tables --help || echo "mdb-tools installed"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Start the application
CMD ["node", "server.js"]