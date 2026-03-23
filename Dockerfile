# Use lightweight Java runtime
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy project
COPY . .

# Build jar
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Run app
CMD ["java", "-jar", "target/*.jar"]
