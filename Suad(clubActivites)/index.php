<?php 
// Database connection settings
$host = 'localhost';
$dbname = 'club_activities';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Extract ID from the URL (used in PUT and DELETE)
$id = null;
if (preg_match('/\/api\.php\/(\d+)/', $path, $matches)) {
    $id = $matches[1];
}

// Handle the HTTP request
switch ($method) {
    case 'GET':
        if ($id) {
            // Get a single activity by ID
            $stmt = $db->prepare("SELECT * FROM activities WHERE id = ?");
            $stmt->execute([$id]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($activity) {
                echo json_encode($activity);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Activity not found"]);
            }
        } else {
            // Get all activities with pagination
            $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
            $offset = ($page - 1) * $limit;

            $stmt = $db->prepare("SELECT * FROM activities LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($activities);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (empty($data['title']) || empty($data['category'])) {
            http_response_code(400);
            echo json_encode(["error" => "Title and category are required"]);
            exit;
        }

        // Sanitize input
        $title = htmlspecialchars(trim($data['title']));
        $category = htmlspecialchars(trim($data['category']));
        $password = isset($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;

        // Insert new activity
        $stmt = $db->prepare("INSERT INTO activities (title, category, password) VALUES (:title, :category, :password)");
        $stmt->execute([
            ':title' => $title,
            ':category' => $category,
            ':password' => $password
        ]);

        http_response_code(201);
        echo json_encode(["message" => "Activity created"]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for update"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $title = isset($data['title']) ? htmlspecialchars(trim($data['title'])) : null;
        $category = isset($data['category']) ? htmlspecialchars(trim($data['category'])) : null;

        // Update activity
        $stmt = $db->prepare("UPDATE activities SET title = :title, category = :category WHERE id = :id");
        $stmt->execute([
            ':title' => $title,
            ':category' => $category,
            ':id' => $id
        ]);

        echo json_encode(["message" => "Activity updated"]);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for delete"]);
            exit;
        }

        // Delete activity
        $stmt = $db->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["message" => "Activity deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
