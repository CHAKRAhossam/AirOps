# Build stage
FROM maven:3.9-eclipse-temurin-21 as builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
COPY --from=builder /app/target/auth-service-*.jar ./app.jar

# Health check (matches Spring Actuator)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8090/actuator/health || exit 1

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]