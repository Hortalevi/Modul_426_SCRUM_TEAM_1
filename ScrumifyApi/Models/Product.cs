namespace MyApi.Models
{
    public class Product
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required decimal Price { get; set; }
    }
}
