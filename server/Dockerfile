FROM golang:1.26-alpine AS builder
WORKDIR /build
COPY go.mod ./
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o server .

FROM alpine:3.20
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /build/server .
EXPOSE 3000
CMD ["./server"]
