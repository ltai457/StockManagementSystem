using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RadiatorStockAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRadiatorModelFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "year",
                table: "radiators");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "radiators",
                newName: "model");

            migrationBuilder.RenameColumn(
                name: "dimensions",
                table: "radiators",
                newName: "dimension");

            migrationBuilder.AddColumn<string>(
                name: "core_dimension",
                table: "radiators",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "radiators",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "radiators",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "core_dimension",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "type",
                table: "radiators");

            migrationBuilder.RenameColumn(
                name: "model",
                table: "radiators",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "dimension",
                table: "radiators",
                newName: "dimensions");

            migrationBuilder.AddColumn<int>(
                name: "year",
                table: "radiators",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
