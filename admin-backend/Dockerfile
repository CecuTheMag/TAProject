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
  mdbtools \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

  # Ensure mdbtools is present after Node install (nodesource scripts may modify apt state)
  RUN apt-get update || true \
   && apt-get install -y --no-install-recommends mdbtools || true \
   && dpkg -l | grep mdbtools || true \
   && ls -la /usr/bin/mdb-* || true

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