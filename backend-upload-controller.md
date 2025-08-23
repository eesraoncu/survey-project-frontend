# Backend Upload Controller Implementation

## 1. UploadController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadPath = "uploads"; // "uploads/images" yerine "uploads"

    public UploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
        
        // Uploads klasörünü oluştur
        var uploadDir = Path.Combine(_environment.WebRootPath, _uploadPath);
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "Resim dosyası bulunamadı" });
            }

            // Dosya boyutu kontrolü (5MB)
            if (image.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "Dosya boyutu 5MB'dan büyük olamaz" });
            }

            // Dosya tipi kontrolü
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Sadece resim dosyaları kabul edilir" });
            }

            // Benzersiz dosya adı oluştur
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_environment.WebRootPath, _uploadPath, fileName);

            // Dosyayı kaydet
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // URL oluştur - /uploads/fileName.jpg şeklinde
            var fileUrl = $"/{_uploadPath}/{fileName}";

            return Ok(new
            {
                message = "Resim başarıyla yüklendi",
                fileName = fileName,
                fileUrl = fileUrl, // Yeni field
                originalName = image.FileName
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Resim yüklenirken bir hata oluştu", error = ex.Message });
        }
    }
}
```

## 2. Program.cs veya Startup.cs'de Static Files Konfigürasyonu

```csharp
// Program.cs veya Startup.cs'de ekleyin
app.UseStaticFiles(); // Bu satır zaten olmalı

// Uploads klasörü için özel static files konfigürasyonu
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")),
    RequestPath = "/uploads"
});
```

## 3. Survey Model'ine BackgroundImage Alanı Ekleme

```csharp
// Survey.cs model'inde
public class Survey
{
    // ... mevcut alanlar ...
    
    public string? SurveyBackgroundImage { get; set; }
}
```

## 4. CreateSurveyRequest DTO'suna BackgroundImage Ekleme

```csharp
public class CreateSurveyRequest
{
    // ... mevcut alanlar ...
    
    public string? SurveyBackgroundImage { get; set; }
}
```

## 5. Survey Service'de BackgroundImage İşleme

```csharp
// SurveyService.cs'de CreateSurvey metodunda
public async Task<Survey> CreateSurvey(CreateSurveyRequest request)
{
    var survey = new Survey
    {
        // ... mevcut alanlar ...
        SurveyBackgroundImage = request.SurveyBackgroundImage
    };
    
    // ... kaydetme işlemi ...
}
```

## 6. wwwroot/uploads/images Klasörü Oluşturma

Backend projenizin `wwwroot` klasörü altında `uploads/images` klasörünü oluşturun.

## 7. .gitignore'a Uploads Klasörü Ekleme

```gitignore
# Uploads klasörü (isteğe bağlı)
wwwroot/uploads/images/*
!wwwroot/uploads/images/.gitkeep
```

## Test Etmek İçin

1. Backend'i çalıştırın
2. Swagger'da `/api/upload/image` endpoint'ini test edin
3. Frontend'den resim yüklemeyi deneyin

## Hata Ayıklama İçin Loglar

Backend'de daha detaylı loglar için:

```csharp
private readonly ILogger<UploadController> _logger;

public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
{
    _environment = environment;
    _logger = logger;
}

[HttpPost("image")]
public async Task<IActionResult> UploadImage(IFormFile image)
{
    _logger.LogInformation("Resim yükleme isteği alındı: {FileName}, Size: {Size}", 
        image?.FileName, image?.Length);
    
    // ... mevcut kod ...
}
```
