using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RadiatorStockAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProductType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "product_type",
                table: "radiators");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "product_type",
                table: "radiators",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
