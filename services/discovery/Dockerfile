# Build stage
FROM maven:3.9-eclipse-temurin-21 as builder
WORKDIR /app
# Copy files from current directory (discovery-service)
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar ./app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]