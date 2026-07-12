FROM python:3.11-slim

WORKDIR /app

# Install git (needed for pip install from GitHub)
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Install hermes-agent from GitHub
RUN pip install --no-cache-dir git+https://github.com/NousResearch/hermes-agent.git

# Install API server dependencies
RUN pip install --no-cache-dir aiohttp

# Copy profile configs
COPY .hermes-brain/ /app/.hermes-brain/
COPY .hermes-storeops/ /app/.hermes-storeops/
COPY .hermes-marketing/ /app/.hermes-marketing/
COPY .hermes-customer/ /app/.hermes-customer/

# Copy skills
COPY skills/ /app/skills/

# Default: start brain gateway (override with HERMES_HOME env var)
ENV HERMES_HOME=/app/.hermes-brain
ENV API_SERVER_ENABLED=true
ENV API_SERVER_HOST=0.0.0.0

EXPOSE 8642

CMD ["hermes", "gateway"]
