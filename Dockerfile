FROM python:3.11

# Set working directory
WORKDIR /code

# Install python dependencies
RUN mkdir /dependencies
COPY ./requirements.txt /dependencies/requirements.txt
RUN pip install -r /dependencies/requirements.txt