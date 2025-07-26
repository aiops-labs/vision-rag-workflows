curl -X POST http://localhost:3000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.statcdn.com/Infographic/images/normal/29774.jpeg",
    "namespace": "default"
  }'

  curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "whats Tesla Profit Margins in 2024",
    "namespace": "default"
  }'


curl -X POST http://localhost:3000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://g.foolcdn.com/image/?url=https%3A%2F%2Fg.foolcdn.com%2Feditorial%2Fimages%2F752297%2F102523-alphabet-google-cloud-growth.png",
    "namespace": "default"
  }'


curl -G http://localhost:3000/api/v1/search \
  --data-urlencode "q=whats Tesla Profit Margins in 2024" \
  --data-urlencode "namespace=default"