FROM python:3.11-slim

WORKDIR /app

# Install hermes-agent
COPY hermes-agent/ /app/hermes-agent/
RUN cd /app/hermes-agent && pip install -e . --no-cache-dir

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
