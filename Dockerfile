FROM rust:1.23.0

WORKDIR /usr/src/app
COPY . .

RUN rustc ./src/main.rs

CMD ["./main"]

