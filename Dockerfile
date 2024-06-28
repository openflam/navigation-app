FROM python:3.11

# Set working directory
WORKDIR /code

# Install python dependencies
RUN mkdir /dependencies
COPY ./requirements.txt /dependencies/requirements.txt
RUN pip install -r /dependencies/requirements.txt

# Generate self-signed certificate
RUN mkdir /ssl
RUN openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=US/ST=Pennsylvania/L=Pittsburgh/O=Sagar/CN=Sagar" \
    -keyout /ssl/key.pem  -out /ssl/cert.pem